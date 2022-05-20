import { Page } from '@playwright/test';

import { CheckoutPagePreset } from '../../../';

import { PollyObject } from './PollyObject';
import { ServerSideRender } from './ServerSideRender';

export interface PageRoutingRule {
    routePath: string;
    filePath: string;
    data?: {};
}

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

    async goto({ storeURL, harName, preset }: { storeURL: string; harName: string; preset: CheckoutPagePreset }): Promise<void> {
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
            await page.route(/\/products\/.*\/images\//, route => route.fulfill({ status: 200, path: './tests/support/product.jpg' }));
            const { checkoutId, orderId } = this.polly.getCartAndOrderIDs();
            await this.serveFile({
                routePath: '/',
                filePath: './tests/support/checkout.ejs',
                data: { checkoutId },
            });
            if (orderId) {
                await this.serveFile({
                    routePath: '/order-confirmation',
                    filePath: './tests/support/orderConfirmation.ejs',
                    data: { orderId },
                });
            }
            await page.goto('/');
        } else {
            if (preset) {
                // Optional: Set Up checkout environment accroding to preset
                this.polly.pause();
                await preset.apply();
                this.polly.play();
            }
            await page.goto(this.storeURL + '/checkout');
        }
    }

    async replayPages(files: PageRoutingRule[]): Promise<void> {
        if (this.isReplay) {
            for (const file of files) {
                await this.serveFile(file);
            }
        }
    }

    async stopAll(): Promise<void> {
        await this.polly.stop();
        await this.page.close();
    }

    private async serveFile({routePath, filePath, data}: PageRoutingRule): Promise<void> {
        const htmlStr = await this.server.renderFile(filePath, data);
        await this.page.route(routePath, route => route.fulfill({
            status: 200,
            contentType: 'text/html',
            body: htmlStr,
        }));
    }
}
