import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { getDefaultTranslations, isLanguageWindow } from '@bigcommerce/checkout/locale';

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
    isConsistentCrossOriginFixEnabled?: boolean;
}

export interface LoadFilesResult {
    appVersion: string;
    renderCheckout(options: RenderCheckoutOptions): void;
    renderOrderConfirmation(options: RenderOrderConfirmationOptions): void;
}

const DIAGNOSTIC_PREFIX = '[checkout-js]';

let areBootstrapDiagnosticsInstalled = false;

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

function preloadWithConsistentCrossOrigin(
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
    const isConsistentCrossOriginFixEnabled = Boolean(options?.isConsistentCrossOriginFixEnabled);

    // diagnostics is also gated behind the same experiment
    if (isConsistentCrossOriginFixEnabled) {
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

    if (isConsistentCrossOriginFixEnabled) {
        preloadWithConsistentCrossOrigin(
            jsDynamicChunks.map((path) => ({
                rel: 'prefetch',
                as: 'script',
                href: joinPaths(publicPath, path),
                integrity: integrity[path],
            })),
        );

        preloadWithConsistentCrossOrigin(
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

    if (!isConsistentCrossOriginFixEnabled) {
        return filesPromise;
    }

    return filesPromise.catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`${DIAGNOSTIC_PREFIX} Failed to bootstrap checkout:`, error);

        throw error;
    });
}
