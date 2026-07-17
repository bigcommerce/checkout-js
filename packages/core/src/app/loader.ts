import { getDefaultTranslations, isLanguageWindow } from '@bigcommerce/checkout/locale';
import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { isAppExport } from './AppExport';
import { type RenderCheckoutOptions } from './checkout';
import { configurePublicPath } from './common/bundler';
import { isRecordContainingKey, joinPaths, yieldToMain } from './common/utility';
import { type RenderOrderConfirmationOptions } from './order';

declare const LIBRARY_NAME: string;
declare const MANIFEST_JSON: AssetManifest;

export interface AssetManifest {
    appVersion: string;
    css: string[];
    dynamicChunks: { [key: string]: string[] };
    js: string[];
    integrity: { [key: string]: string };
}

export interface LoadFilesOptions {
    publicPath?: string;
    isSafePrefetchEnabled?: boolean;
}

export interface LoadFilesResult {
    appVersion: string;
    renderCheckout(options: RenderCheckoutOptions): void;
    renderOrderConfirmation(options: RenderOrderConfirmationOptions): void;
}

const DIAGNOSTIC_PREFIX = '[checkout-js]';

let areBootstrapDiagnosticsInstalled = false;

/**
 * Bootstrap failures (a chunk that never loads, an uncaught exception thrown by
 * another script on the page, a rejected promise inside the loader itself) currently
 * have no error reporting: Sentry is only initialized once the checkout app has
 * rendered, which is exactly the thing that doesn't happen when bootstrap fails. These
 * listeners are a last-resort safety net so a failure at least leaves a clear,
 * greppable trace in the console instead of a silent, unexplained hang. They are
 * intentionally left installed for the lifetime of the page (not just the bootstrap
 * window), since we've also seen checkout go silent minutes after a successful initial
 * load (e.g. mid-way through the shipping step).
 */
function installBootstrapDiagnostics(): void {
    if (areBootstrapDiagnosticsInstalled || typeof window === 'undefined') {
        return;
    }

    areBootstrapDiagnosticsInstalled = true;

    window.addEventListener('error', (event) => {
        // eslint-disable-next-line no-console
        console.error(
            `${DIAGNOSTIC_PREFIX} Uncaught error on the checkout page:`,
            event.error || event.message,
        );
    });

    window.addEventListener('unhandledrejection', (event) => {
        // eslint-disable-next-line no-console
        console.error(
            `${DIAGNOSTIC_PREFIX} Unhandled promise rejection on the checkout page:`,
            event.reason,
        );
    });
}

function preloadWithCrossOrigin(
    tags: Array<{ rel: string; as: string; href: string; integrity?: string }>,
): void {
    tags.forEach(({ rel, as, href, integrity }) => {
        const link = document.createElement('link');

        link.setAttribute('rel', rel);
        link.setAttribute('as', as);
        link.setAttribute('href', href);
        link.setAttribute('crossorigin', 'anonymous');

        if (integrity) {
            link.setAttribute('integrity', integrity);
        }

        document.head.appendChild(link);
    });
}

export function loadFiles(options?: LoadFilesOptions): Promise<LoadFilesResult> {
    const publicPath = configurePublicPath(options && options.publicPath);
    const isSafePrefetchEnabled = Boolean(options?.isSafePrefetchEnabled);

    // Gated behind the same flag as the crossorigin/SRI prefetch fix below: existing
    // stores (flag off) get byte-for-byte the same behavior as before this diagnostics
    // work existed. Only stores opted into the fix also get the extra error visibility
    // while we validate the rollout.
    if (isSafePrefetchEnabled) {
        installBootstrapDiagnostics();
    }

    const {
        appVersion,
        css = [],
        dynamicChunks: { css: cssDynamicChunks = [], js: jsDynamicChunks = [] },
        js = [],
        integrity = {},
    } = MANIFEST_JSON;

    const scripts = Promise.all(
        js
            .filter((path) => !path.startsWith('loader'))
            .map((path) =>
                getScriptLoader().loadScript(joinPaths(publicPath, path), {
                    async: false,
                    attributes: integrity[path]
                        ? {
                              crossorigin: 'anonymous',
                              integrity: integrity[path],
                          }
                        : {},
                }),
            ),
    );

    const stylesheets = Promise.all(
        css.map((path) =>
            getStylesheetLoader().loadStylesheet(joinPaths(publicPath, path), {
                prepend: true,
                attributes: integrity[path]
                    ? {
                          crossorigin: 'anonymous',
                          integrity: integrity[path],
                      }
                    : {},
            }),
        ),
    );

    if (isSafePrefetchEnabled) {
        // `@bigcommerce/script-loader`'s preloadScripts/preloadStylesheets create
        // `<link rel="prefetch">` tags with no `crossorigin` attribute, while webpack's
        // runtime later loads these same chunk URLs with `crossorigin="anonymous"` plus a
        // Subresource Integrity hash. A browser can end up reusing the crossorigin-less
        // prefetch response for the later CORS+SRI request, which silently fails to
        // execute. Build the prefetch tags ourselves so the attributes match.
        preloadWithCrossOrigin(
            jsDynamicChunks.map((path) => ({
                rel: 'prefetch',
                as: 'script',
                href: joinPaths(publicPath, path),
                integrity: integrity[path],
            })),
        );

        preloadWithCrossOrigin(
            cssDynamicChunks.map((path) => ({
                rel: 'prefetch',
                as: 'style',
                href: joinPaths(publicPath, path),
                integrity: integrity[path],
            })),
        );
    } else {
        getScriptLoader().preloadScripts(
            jsDynamicChunks.map((path) => joinPaths(publicPath, path)),
            { prefetch: true },
        );

        getStylesheetLoader().preloadStylesheets(
            cssDynamicChunks.map((path) => joinPaths(publicPath, path)),
            { prefetch: true },
        );
    }

    const languageConfig = isLanguageWindow(window)
        ? window.language
        : { locale: 'en', locales: {}, translations: {} };

    const filesPromise = Promise.all([
        getDefaultTranslations(languageConfig.locale),
        scripts,
        stylesheets,
    ]).then(([defaultTranslations]) => {
        if (!isRecordContainingKey(window, LIBRARY_NAME)) {
            throw new Error(`'${LIBRARY_NAME}' property is not available in window.`);
        }

        const appExport = window[LIBRARY_NAME];

        if (!isAppExport(appExport)) {
            throw new Error(
                'The functions required to bootstrap the application are not available.',
            );
        }

        const { renderCheckout, renderOrderConfirmation, initializeLanguageService } = appExport;

        initializeLanguageService({
            ...languageConfig,
            defaultTranslations,
        });

        return {
            appVersion,
            renderCheckout: async (renderOptions) => {
                await yieldToMain();
                renderCheckout({ publicPath, ...renderOptions });
            },
            renderOrderConfirmation: async (renderOptions) => {
                await yieldToMain();
                renderOrderConfirmation({ publicPath, ...renderOptions });
            },
        };
    });

    // Same gating as above: don't attach a `.catch()` at all unless the flag is on, so
    // existing stores get the exact same promise behavior as before this existed.
    if (!isSafePrefetchEnabled) {
        return filesPromise;
    }

    return filesPromise.catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`${DIAGNOSTIC_PREFIX} Failed to bootstrap checkout:`, error);

        throw error;
    });
}
