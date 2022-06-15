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
    private isDevMode: boolean = false;
    private har: string = '';
    private storeUrl: string = '';

    constructor(page: Page) {
        this.page = page;
        this.mode = process.env.MODE?.toLowerCase() === 'record'  ? 'record' : 'replay';
        this.isReplay = this.mode === 'replay';
        this.polly = new PollyObject(this.mode);
        this.server = new ServerSideRender();
    }

    enableDevMode(): void {
        this.isDevMode = true;
        // tslint:disable-next-line:no-console
        this.page.on('console', msg => console.log(`🧭 ${msg.text()}`));
    }

    async goto(): Promise<void> {
        if (this.isReplay) {
            await this.page.goto('/');
        } else {
            await this.page.goto(this.storeUrl + '/checkout');
        }
    }

    async createCheckout(har: string, storeUrl: string): Promise<void> {
        this.har = har;
        this.storeUrl = storeUrl.substr(-1) === '/' ? storeUrl.slice(0, -1) : storeUrl;

        await this.polly.start({
            devMode: this.isDevMode,
            page: this.page,
            har: this.har,
        });

        await this.page.route(/.*\/products\/.*\/images\/.*/, route => route.fulfill({ status: 200, path: './tests/support/product.png' }));

        if (this.isReplay) {
            // creating local checkout environment during replay
            this.polly.enableReplay(this.storeUrl);
            const { checkoutId, orderId } = this.polly.getCartAndOrderIDs();
            await this.renderAndRoute('/', './tests/support/checkout.ejs', { checkoutId });
            await this.renderAndRoute('/order-confirmation', './tests/support/orderConfirmation.ejs', { orderId });
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

    async renderAndRoute(url: string | RegExp | ((url: URL) => boolean), filePath: string, data?: {}): Promise<void> {
        if (includes(filePath, 'ejs')) {
            const localhostUrl = 'http://localhost:' + process.env.PORT;
            const storeUrl = this.isReplay ? localhostUrl : this.storeUrl;
            const checkoutUrl = this.isReplay ? localhostUrl : storeUrl + '/checkout';
            const htmlStr = await this.server.renderFile(filePath, { ...data, localhostUrl, storeUrl, checkoutUrl });
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
