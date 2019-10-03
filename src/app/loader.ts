import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';

import { RenderCheckoutOptions } from './checkout';
import { configurePublicPath } from './common/bundler';
import { joinPaths } from './common/utility';
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
        dynamicChunks: {
            css: cssDynamicChunks = [],
            js: jsDynamicChunks = [],
        },
        js = [],
    } = MANIFEST_JSON;

    const scripts = getScriptLoader().loadScripts(
        js.map(path => joinPaths(publicPath, path))
    );

    const stylesheets = getStylesheetLoader().loadStylesheets(
        css.map(path => joinPaths(publicPath, path)),
        { prepend: true }
    );

    getScriptLoader().preloadScripts(
        jsDynamicChunks.map(path => joinPaths(publicPath, path)),
        { prefetch: true }
    );

    getStylesheetLoader().preloadStylesheets(
        cssDynamicChunks.map(path => joinPaths(publicPath, path)),
        { prefetch: true }
    );

    return Promise.all([
        scripts,
        stylesheets,
    ])
        .then(() => {
            const { renderCheckout, renderOrderConfirmation } = (window as any)[LIBRARY_NAME];

            return {
                appVersion,
                renderCheckout: renderOptions => renderCheckout({ publicPath, ...renderOptions }),
                renderOrderConfirmation: renderOptions => renderOrderConfirmation({ publicPath, ...renderOptions }),
            };
        });
}
