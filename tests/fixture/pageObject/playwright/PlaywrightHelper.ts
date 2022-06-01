import { Page } from '@playwright/test';
import { includes } from 'lodash';

import { CheckoutPagePreset } from '../../../';

import { PollyObject } from './PollyObject';
import { ServerSideRender } from './ServerSideRender';

export class PlaywrightHelper {
    private readonly isReplay: boolean;
    private readonly mode: 'record' | 'replay';
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

    async goto(): Promise<void> {
        if (this.isReplay) {
            await this.page.goto('/');
        } else {
            await this.page.goto(this.storeURL + '/checkout');
        }
    }

    async record(storeURL: string, harName: string): Promise<void> {
        this.storeURL = storeURL;
        this.harName = harName;

        await this.polly.start({
            page: this.page,
            mode: this.mode,
            harName: this.harName,
            storeURL: this.storeURL,
        });

        if (this.isReplay) {
            // rendering local checkout page
            await this.page.route(/\/products\/.*\/images\//, route => route.fulfill({ status: 200, path: './tests/support/product.jpg' }));
            const { checkoutId, orderId } = this.polly.getCartAndOrderIDs();
            await this.routeAndRender('/checkout.php', './tests/support/checkout.php.ejs', { storeURL: this.storeURL });
            await this.routeAndRender('/', './tests/support/checkout.ejs', { checkoutId });
            if (orderId) {
                await this.routeAndRender('/order-confirmation', './tests/support/orderConfirmation.ejs', { orderId });
            }
        }
    }

    async applyPreset(preset: CheckoutPagePreset): Promise<void> {
        if (!this.isReplay) {
            this.polly.pause();
            await preset.apply();
            this.polly.play();
        }
    }

    async stopAll(): Promise<void> {
        await this.polly.stop();
        await this.page.close();
    }

    async routeAndRender(url: string | RegExp | ((url: URL) => boolean), filePath: string, data?: {}): Promise<void> {
        if (includes(filePath, 'ejs')) {
            const htmlStr = await this.server.renderFile(filePath, data);
            await this.page.route(url, route => route.fulfill({
                status: 200,
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
