import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';
import { noop } from 'lodash';

import { CHECKOUT_ROOT_NODE_ID } from '@bigcommerce/checkout/payment-integration-api';

import AppExport from './AppExport';
import { AssetManifest, loadFiles, LoadFilesOptions } from './loader';

jest.mock('@bigcommerce/script-loader', () => {
    return {
        getScriptLoader: jest.fn().mockReturnValue({
            loadScripts: jest.fn(() => Promise.resolve()),
            preloadScripts: jest.fn(() => Promise.resolve()),
        }),
        getStylesheetLoader: jest.fn().mockReturnValue({
            loadStylesheets: jest.fn(() => Promise.resolve()),
            preloadStylesheets: jest.fn(() => Promise.resolve()),
        }),
    };
});

describe('loadFiles', () => {
    let manifestJson: AssetManifest;
    let options: LoadFilesOptions;
    let appExports: AppExport;

    beforeEach(() => {
        options = {
            publicPath: 'https://cdn.foo.bar/',
        };

        manifestJson = {
            appVersion: '1.0.0',
            css: ['vendor.css', 'main.css'],
            dynamicChunks: {
                css: ['step-a.css', 'step-b.css'],
                js: ['step-a.js', 'step-b.js'],
            },
            js: ['vendor.js', 'main.js'],
        };

        (global as any).MANIFEST_JSON = manifestJson;
        (global as any).LIBRARY_NAME = 'checkout';
        (global as any).checkout = appExports = {
            renderCheckout: jest.fn(),
            renderOrderConfirmation: jest.fn(),
            initializeLanguageService: jest.fn(),
        };
    });

    afterEach(() => {
        delete (global as any).MANIFEST_JSON;
        delete (global as any).LIBRARY_NAME;
        delete (global as any).checkout;
    });

    it('loads required JS files listed in manifest', async () => {
        await loadFiles(options);

        expect(getScriptLoader().loadScripts).toHaveBeenCalledWith([
            'https://cdn.foo.bar/vendor.js',
            'https://cdn.foo.bar/main.js',
        ]);
    });

    it('loads required CSS files listed in manifest', async () => {
        await loadFiles(options);

        expect(getStylesheetLoader().loadStylesheets).toHaveBeenCalledWith(
            ['https://cdn.foo.bar/vendor.css', 'https://cdn.foo.bar/main.css'],
            { prepend: true },
        );
    });

    it('prefetches dynamic JS chunks listed in manifest', async () => {
        await loadFiles(options);

        expect(getScriptLoader().preloadScripts).toHaveBeenCalledWith(
            ['https://cdn.foo.bar/step-a.js', 'https://cdn.foo.bar/step-b.js'],
            { prefetch: true },
        );
    });

    it('prefetches dynamic CSS chunks listed in manifest', async () => {
        await loadFiles(options);

        expect(getStylesheetLoader().preloadStylesheets).toHaveBeenCalledWith(
            ['https://cdn.foo.bar/step-a.css', 'https://cdn.foo.bar/step-b.css'],
            { prefetch: true },
        );
    });

    it('resolves with app version', async () => {
        const result = await loadFiles(options);

        expect(result.appVersion).toEqual(manifestJson.appVersion);
    });

    it('resolves with render checkout function', async () => {
        const result = await loadFiles(options);

        result.renderCheckout({
            checkoutId: 'abc',
            containerId: CHECKOUT_ROOT_NODE_ID,
        });

        expect((global as any).checkout.renderCheckout).toHaveBeenCalledWith({
            checkoutId: 'abc',
            containerId: CHECKOUT_ROOT_NODE_ID,
            publicPath: options.publicPath,
        });
    });

    it('resolves with render order confirmation function', async () => {
        const result = await loadFiles(options);

        result.renderOrderConfirmation({
            orderId: 123,
            containerId: CHECKOUT_ROOT_NODE_ID,
        });

        expect((global as any).checkout.renderOrderConfirmation).toHaveBeenCalledWith({
            orderId: 123,
            containerId: CHECKOUT_ROOT_NODE_ID,
            publicPath: options.publicPath,
        });
    });

    it('does not wait for prefetched scripts to resolve', async () => {
        const scriptLoader = getScriptLoader();

        jest.spyOn(scriptLoader, 'preloadScripts').mockImplementation((_url, opt) => {
            return opt && opt.prefetch ? new Promise(noop) : Promise.resolve();
        });

        expect(await loadFiles(options)).toBeDefined();
    });

    it('initializes language service with default translations', async () => {
        await loadFiles(options);

        expect(appExports.initializeLanguageService).toHaveBeenCalledWith({
            defaultTranslations: expect.any(Object),
            locale: expect.any(String),
            locales: expect.any(Object),
            translations: expect.any(Object),
        });
    });
});
