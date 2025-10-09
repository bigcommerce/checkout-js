import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { getDefaultTranslations, isLanguageWindow } from '@bigcommerce/checkout/locale';

import { isAppExport } from './AppExport';
import { type RenderCheckoutOptions } from './checkout';
import { configurePublicPath } from './common/bundler';
import { isRecordContainingKey, joinPaths, yieldToMain } from './common/utility';
import { type RenderOrderConfirmationOptions } from './order';

declare const LIBRARY_NAME: string;
declare const MANIFEST_JSON: AssetManifest;
declare const PRELOAD_ASSETS: string[];

export interface AssetManifest {
    appVersion: string;
    css: string[];
    dynamicChunks: { [key: string]: string[] };
    js: string[];
    integrity: { [key: string]: string };
}

export interface LoadFilesOptions {
    publicPath?: string;
    isIntegrityHashExperimentEnabled?: boolean;
    isCspNonceExperimentEnabled?: boolean;
}

export interface LoadFilesResult {
    appVersion: string;
    renderCheckout(options: RenderCheckoutOptions): void;
    renderOrderConfirmation(options: RenderOrderConfirmationOptions): void;
}

export function loadFiles(options?: LoadFilesOptions): Promise<LoadFilesResult> {
    const publicPath = configurePublicPath(options && options.publicPath);
    const isIntegrityHashExperimentEnabled = options?.isIntegrityHashExperimentEnabled ?? true;
    const isCspNonceExperimentEnabled = options?.isCspNonceExperimentEnabled ?? true;
    const {
        appVersion,
        css = [],
        dynamicChunks: { css: cssDynamicChunks = [], js: jsDynamicChunks = [] },
        js = [],
        integrity = {},
    } = MANIFEST_JSON;

    const scripts = Promise.all(js.filter(path => !path.startsWith('loader')).map((path) =>
        getScriptLoader().loadScript(joinPaths(publicPath, path), {
            async: false,
            attributes: isIntegrityHashExperimentEnabled && integrity[path] ? {
                crossorigin: 'anonymous',
                integrity: integrity[path],
            } : {},
        })
    ));

    const stylesheets = Promise.all(css.map((path) =>
        getStylesheetLoader().loadStylesheet(joinPaths(publicPath, path), {
            prepend: true,
            attributes: isIntegrityHashExperimentEnabled && integrity[path] ? {
                crossorigin: 'anonymous',
                integrity: integrity[path],
            } : {},
        })
    ));

    getScriptLoader().preloadScripts(
        jsDynamicChunks
            .filter((path) => PRELOAD_ASSETS.some((preloadPath) => path.startsWith(preloadPath)))
            .map((path) => joinPaths(publicPath, path)),
        { prefetch: true },
    );

    getStylesheetLoader().preloadStylesheets(
        cssDynamicChunks
            .filter((path) => PRELOAD_ASSETS.some((preloadPath) => path.startsWith(preloadPath)))
            .map((path) => joinPaths(publicPath, path)),
        { prefetch: true },
    );

    const languageConfig = isLanguageWindow(window)
        ? window.language
        : { locale: 'en', locales: {}, translations: {} };

    return Promise.all([getDefaultTranslations(languageConfig.locale), scripts, stylesheets]).then(
        ([defaultTranslations]) => {
            if (!isRecordContainingKey(window, LIBRARY_NAME)) {
                throw new Error(`'${LIBRARY_NAME}' property is not available in window.`);
            }

            const appExport = window[LIBRARY_NAME];

            if (!isAppExport(appExport)) {
                throw new Error(
                    'The functions required to bootstrap the application are not available.',
                );
            }

            const { renderCheckout, renderOrderConfirmation, initializeLanguageService } =
                appExport;

            initializeLanguageService({
                ...languageConfig,
                defaultTranslations,
                isCspNonceExperimentEnabled,
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
        },
    );
}
