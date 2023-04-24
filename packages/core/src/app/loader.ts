import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { getDefaultTranslations, isLanguageWindow } from '@bigcommerce/checkout/locale';

import { isAppExport } from './AppExport';
import { RenderCheckoutOptions } from './checkout';
import { configurePublicPath } from './common/bundler';
import { isRecordContainingKey, joinPaths } from './common/utility';
import { RenderOrderConfirmationOptions } from './order';

declare const LIBRARY_NAME: string;
declare const MANIFEST_JSON: AssetManifest;

export interface AssetManifest {
    appVersion: string;
    css: string[];
    dynamicChunks: { [key: string]: string[] };
    js: string[];
}

export interface LoadFilesOptions {
    publicPath?: string;
}

export interface LoadFilesResult {
    appVersion: string;
    renderCheckout(options: RenderCheckoutOptions): void;
    renderOrderConfirmation(options: RenderOrderConfirmationOptions): void;
}

export function loadFiles(options?: LoadFilesOptions): Promise<LoadFilesResult> {
    const publicPath = configurePublicPath(options && options.publicPath);
    const {
        appVersion,
        css = [],
        dynamicChunks: { css: cssDynamicChunks = [], js: jsDynamicChunks = [] },
        js = [],
    } = MANIFEST_JSON;

    const scripts = getScriptLoader().loadScripts(js.map((path) => joinPaths(publicPath, path)));

    const stylesheets = getStylesheetLoader().loadStylesheets(
        css.map((path) => joinPaths(publicPath, path)),
        { prepend: true },
    );

    getScriptLoader().preloadScripts(
        jsDynamicChunks.map((path) => joinPaths(publicPath, path)),
        { prefetch: true },
    );

    getStylesheetLoader().preloadStylesheets(
        cssDynamicChunks.map((path) => joinPaths(publicPath, path)),
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
            });

            return {
                appVersion,
                renderCheckout: (renderOptions) => renderCheckout({ publicPath, ...renderOptions }),
                renderOrderConfirmation: (renderOptions) =>
                    renderOrderConfirmation({ publicPath, ...renderOptions }),
            };
        },
    );
}
