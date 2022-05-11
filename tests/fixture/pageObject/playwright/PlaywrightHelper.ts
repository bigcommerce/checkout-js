import { Page } from '@playwright/test';
import { MODE } from '@pollyjs/core';

import ApiRequestsSender from './ApiRequestsSender';
import PollyObject from './PollyObject';
import ServerSideRender from './ServerSideRender';

export enum CheckoutPresets {
    PaymentStepAsGuest,
}

export default class PlaywrightHelper {
    private readonly isReplay: boolean;
    private readonly mode: MODE;
    private readonly page: Page;
    private readonly polly: PollyObject;
    private readonly server: ServerSideRender;
    private harName: string;
    private storeURL: string;

    constructor(page: Page) {
        this.page = page;
        this.mode = process.env.MODE?.toLowerCase() === 'record'  ? 'record' : 'replay';
        this.isReplay = this.mode === 'replay';
        this.polly = new PollyObject(this.mode);
        this.server = new ServerSideRender();
        this.storeURL = '';
        this.harName = '';
    }

    async goto({ storeURL, harName, preset }: { storeURL: string; harName: string; preset: CheckoutPresets }): Promise<void> {
        const page = this.page;
        this.storeURL = storeURL;
        this.harName = harName;

        await this.polly.start({
            page,
            mode: this.mode,
            harName: this.harName,
            storeURL: this.storeURL,
        });

        if (this.isReplay) {
            // Server-side rendering
            const cartAndOrderIDs = this.polly.getCartAndOrderIDs();
            await this.serveFile({
                routePath: '/',
                filePath: './tests/support/checkout.ejs',
                data: cartAndOrderIDs,
            });
            await this.serveFile({
                routePath: '/order-confirmation',
                filePath: './tests/support/orderConfirmation.ejs',
                data: cartAndOrderIDs,
            });
            await page.route(/\/products\/.*\/images\//, route => route.fulfill({ status: 200, path: './tests/support/product.jpg' }));
            await page.goto('/');
        } else {
            // TODO: Use direct API calls to create a cart
            this.polly.pause();
            const api = new ApiRequestsSender(this.page, storeURL);
            switch (preset) {
                // TODO: more presets
                case CheckoutPresets.PaymentStepAsGuest:
                    await api.addPhysicalItemToCart();
                    await api.completeCustomerStepAsGuest();
                    await api.completeShippingStepAndSkipBilling();
                    break;
                default:
                    await api.addPhysicalItemToCart();
            }
            this.polly.play();
            await page.goto(this.storeURL + '/checkout');
        }
    }

    async serveFile({routePath, filePath, data}: {routePath: string; filePath: string; data?: {}}): Promise<void> {
        const htmlStr = await this.server.renderFile({filePath, data});
        await this.page.route(routePath, route => route.fulfill({
            status: 200,
            contentType: 'text/html',
            body: htmlStr,
        }));
    }

    async stopAll(): Promise<void> {
        await this.polly.stop();
        await this.page.close();
    }
}
