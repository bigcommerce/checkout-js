import { Page } from '@playwright/test';
import { includes } from 'lodash';

import { CheckoutPagePreset } from '../../../';
import { getStoreUrl } from "../../";

import { PollyObject } from './PollyObject';
import { ServerSideRender } from './ServerSideRender';

export class PlaywrightHelper {
    private readonly isReplay: boolean;
    private readonly mode: 'record' | 'replay';
    private readonly page: Page;
    private readonly polly: PollyObject;
    private readonly server: ServerSideRender;
    private readonly storeUrl: string;
    private readonly srcPath = './packages/payment-integration-test-framework/src';
    private isDevMode = false;
    private har = '';

    constructor(page: Page) {
        this.page = page;
        this.mode = process.env.MODE?.toLowerCase() === 'record'  ? 'record' : 'replay';
        this.isReplay = this.mode === 'replay';
        this.polly = new PollyObject(this.mode);
        this.server = new ServerSideRender();
        this.storeUrl = getStoreUrl();
    }

    enableDevMode(): void {
        this.isDevMode = true;
        this.page.on('console', msg => console.log(`🧭 ${msg.text()}`));
    }

    async goto(): Promise<void> {
        if (this.isReplay) {
            await this.page.goto('/checkout');
        } else {
            await this.page.goto(this.storeUrl + '/checkout');
        }
    }

    async useHAR(har: string, folder: string): Promise<void> {
        this.har = har;

        await this.polly.start({
            devMode: this.isDevMode,
            page: this.page,
            har: this.har,
            harFolder: folder,
        });

        await this.page.route(/.*\/products\/.*\/images\/.*/, route => route.fulfill({ status: 200, path: this.srcPath + '/support/product.png' }));

        if (this.isReplay) {
            // creating local checkout environment during replay
            this.polly.enableReplay();
            const { checkoutId, orderId } = this.polly.getCartAndOrderIDs();
            await this.renderAndRoute('/checkout', this.srcPath + '/support/checkout.ejs', { checkoutId });
            await this.renderAndRoute(/order-confirmation.*/, this.srcPath + '/support/orderConfirmation.ejs', { orderId });
        } else {
            this.polly.enableRecord();
        }
    }

    async usePreset(preset: CheckoutPagePreset): Promise<void> {
        if (!this.isReplay) {
            this.polly.pause();
            await preset.apply(this.page);
            this.polly.play();
        }
    }

    async stopAll(): Promise<void> {
        await this.polly.stop();
        await this.page.close();
    }

    async renderAndRoute(url: string | RegExp | ((url: URL) => boolean), filePath: string, data?: Record<string, unknown>): Promise<void> {
        if (includes(filePath, 'ejs')) {
            const localhostUrl = 'http://localhost:' + process.env.PORT;
            const storeUrl = this.isReplay ? localhostUrl : this.storeUrl;
            const checkoutUrl = this.isReplay ? localhostUrl + '/checkout' : storeUrl + '/checkout';
            const htmlStr = await this.server.renderFile(filePath, { ...data, localhostUrl, storeUrl, checkoutUrl });
            await this.page.route(url, route => route.fulfill({
                status: 200,
                contentType: 'text/html; charset=UTF-8',
                body: htmlStr,
            }));
        } else {
            await this.page.route(url, route => route.fulfill({
                status: 200,
                path: filePath,
            }));
        }
    }
}
