import { getScriptLoader, getStylesheetLoader } from '@bigcommerce/script-loader';
import { noop } from 'lodash';

import { CHECKOUT_ROOT_NODE_ID } from '@bigcommerce/checkout/payment-integration-api';

import type AppExport from './AppExport';
import { type AssetManifest, loadFiles, type LoadFilesOptions } from './loader';

jest.mock('@bigcommerce/script-loader', () => {
    return {
        getScriptLoader: jest.fn().mockReturnValue({
            loadScript: jest.fn(() => Promise.resolve()),
            preloadScripts: jest.fn(() => Promise.resolve()),
        }),
        getStylesheetLoader: jest.fn().mockReturnValue({
            loadStylesheet: jest.fn(() => Promise.resolve()),
            preloadStylesheets: jest.fn(() => Promise.resolve()),
        }),
    };
});

describe('loadFiles', () => {
    let manifestJson: AssetManifest;
    let options: LoadFilesOptions;
    let appExports: AppExport;

    beforeEach(() => {
        jest.clearAllMocks();

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
            integrity: {
                'main.js': 'hash-main-js',
                'main.css': 'hash-main-css',
                'vendor.js': 'hash-vendor-js',
                'vendor.css': 'hash-vendor-css',
                'step-a.js': 'hash-step-a-js',
                'step-b.js': 'hash-step-b-js',
                'step-a.css': 'hash-step-a-css',
                'step-b.css': 'hash-step-b-css',
            },
        };

        (global as any).MANIFEST_JSON = manifestJson;
        (global as any).LIBRARY_NAME = 'checkout';
        (global as any).checkout = appExports = {
            renderCheckout: jest.fn(),
            renderOrderConfirmation: jest.fn(),
            initializeLanguageService: jest.fn(),
        };
        (global as any).PRELOAD_ASSETS = ['step-a.js', 'step-b.js', 'step-a.css', 'step-b.css'];

        (global as any).scheduler = {
            yield() {
                return new Promise((resolve) => process.nextTick(resolve));
            },
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();

        document.head.querySelectorAll('link[rel="prefetch"]').forEach((link) => {
            link.remove();
        });

        delete (global as any).MANIFEST_JSON;
        delete (global as any).LIBRARY_NAME;
        delete (global as any).checkout;
    });

    it('loads required JS files listed in manifest', async () => {
        await loadFiles(options);

        expect(getScriptLoader().loadScript).toHaveBeenCalledWith('https://cdn.foo.bar/vendor.js', {
            async: false,
            attributes: {
                crossorigin: 'anonymous',
                integrity: 'hash-vendor-js',
            },
        });
        expect(getScriptLoader().loadScript).toHaveBeenCalledWith('https://cdn.foo.bar/main.js', {
            async: false,
            attributes: {
                crossorigin: 'anonymous',
                integrity: 'hash-main-js',
            },
        });
    });

    it('loads required CSS files listed in manifest', async () => {
        await loadFiles(options);

        expect(getStylesheetLoader().loadStylesheet).toHaveBeenCalledWith(
            'https://cdn.foo.bar/vendor.css',
            {
                prepend: true,
                attributes: {
                    crossorigin: 'anonymous',
                    integrity: 'hash-vendor-css',
                },
            },
        );
        expect(getStylesheetLoader().loadStylesheet).toHaveBeenCalledWith(
            'https://cdn.foo.bar/main.css',
            {
                prepend: true,
                attributes: {
                    crossorigin: 'anonymous',
                    integrity: 'hash-main-css',
                },
            },
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

    describe('when isConsistentCrossOriginFixEnabled is true', () => {
        it('does not use script-loader to prefetch dynamic JS or CSS chunks', async () => {
            await loadFiles({ ...options, isConsistentCrossOriginFixEnabled: true });

            expect(getScriptLoader().preloadScripts).not.toHaveBeenCalled();
            expect(getStylesheetLoader().preloadStylesheets).not.toHaveBeenCalled();
        });

        it('prefetches dynamic JS chunks with crossorigin matching the real chunk requests', async () => {
            await loadFiles({ ...options, isConsistentCrossOriginFixEnabled: true });

            const links = document.head.querySelectorAll<HTMLLinkElement>(
                'link[rel="prefetch"][as="script"]',
            );

            expect(links).toHaveLength(2);
            expect(links[0]).toHaveAttribute('href', 'https://cdn.foo.bar/step-a.js');
            expect(links[0]).toHaveAttribute('crossorigin', 'anonymous');
            expect(links[1]).toHaveAttribute('href', 'https://cdn.foo.bar/step-b.js');
            expect(links[1]).toHaveAttribute('crossorigin', 'anonymous');
        });

        it('prefetches dynamic CSS chunks with crossorigin matching the real chunk requests', async () => {
            await loadFiles({ ...options, isConsistentCrossOriginFixEnabled: true });

            const links = document.head.querySelectorAll<HTMLLinkElement>(
                'link[rel="prefetch"][as="style"]',
            );

            expect(links).toHaveLength(2);
            expect(links[0]).toHaveAttribute('href', 'https://cdn.foo.bar/step-a.css');
            expect(links[0]).toHaveAttribute('crossorigin', 'anonymous');
            expect(links[1]).toHaveAttribute('href', 'https://cdn.foo.bar/step-b.css');
            expect(links[1]).toHaveAttribute('crossorigin', 'anonymous');
        });

        it('omits integrity from prefetch links since browsers ignore it and SRI is checked on the real chunk requests', async () => {
            await loadFiles({ ...options, isConsistentCrossOriginFixEnabled: true });

            const links = document.head.querySelectorAll<HTMLLinkElement>('link[rel="prefetch"]');

            expect(links).toHaveLength(4);
            links.forEach((link) => {
                expect(link).not.toHaveAttribute('integrity');
            });
        });

        it('logs a failure tied to the specific prefetch link that failed, without a page-wide listener', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => undefined);
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

            await loadFiles({ ...options, isConsistentCrossOriginFixEnabled: true });

            expect(addEventListenerSpy).not.toHaveBeenCalledWith('error', expect.anything());
            expect(addEventListenerSpy).not.toHaveBeenCalledWith(
                'unhandledrejection',
                expect.anything(),
            );

            const [failingLink] = document.head.querySelectorAll<HTMLLinkElement>(
                'link[rel="prefetch"][as="script"]',
            );

            failingLink.dispatchEvent(new Event('error'));

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[checkout-js] Failed to prefetch:',
                'https://cdn.foo.bar/step-a.js',
            );
        });
    });

    it('resolves with app version', async () => {
        const result = await loadFiles(options);

        expect(result.appVersion).toEqual(manifestJson.appVersion);
    });

    it('resolves with render checkout function', async () => {
        const result = await loadFiles(options);

        await result.renderCheckout({
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

        await result.renderOrderConfirmation({
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
        await loadFiles({
            ...options,
        });

        expect(appExports.initializeLanguageService).toHaveBeenCalledWith({
            defaultTranslations: expect.any(Object),
            locale: expect.any(String),
            locales: expect.any(Object),
            translations: expect.any(Object),
        });
    });

    describe('bootstrap diagnostics', () => {
        it('does not log anything when isConsistentCrossOriginFixEnabled is off, preserving existing behavior', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => undefined);
            const bootstrapError = new Error('vendor.js failed to load');

            jest.spyOn(getScriptLoader(), 'loadScript').mockImplementation((src: string) =>
                src.includes('vendor.js') ? Promise.reject(bootstrapError) : Promise.resolve(),
            );

            await expect(loadFiles(options)).rejects.toThrow(bootstrapError);

            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('logs a clear, greppable message and still rejects if bootstrapping fails when isConsistentCrossOriginFixEnabled is on', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => undefined);
            const bootstrapError = new Error('vendor.js failed to load');

            jest.spyOn(getScriptLoader(), 'loadScript').mockImplementation((src: string) =>
                src.includes('vendor.js') ? Promise.reject(bootstrapError) : Promise.resolve(),
            );

            await expect(
                loadFiles({ ...options, isConsistentCrossOriginFixEnabled: true }),
            ).rejects.toThrow(bootstrapError);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[checkout-js] Failed to bootstrap checkout:',
                bootstrapError,
            );
        });
    });
});
