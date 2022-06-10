import { Page } from '@playwright/test';

import { CheckoutPagePreset } from '../../';

import { PlaywrightHelper } from '.';

export class Checkout {
    private readonly page: Page;
    private readonly playwright: PlaywrightHelper;

    constructor(page: Page) {
        this.page = page;
        this.playwright = new PlaywrightHelper(page);
    }

    // This is for a developer to debug PollyJS replay quickly.
    // Should not be used in a final test file.
    log(): void {
        this.playwright.enableDevMode();
    }

    async close(): Promise<void> {
        await this.playwright.stopAll();
    }

    async create(har: string, storeUrl: string): Promise<void> {
        await this.playwright.createCheckout(har, storeUrl);
    }

    async route(url: string | RegExp | ((url: URL) => boolean), filePath: string, data?: {}): Promise<void> {
        await this.playwright.renderAndRoute(url, filePath, data);
    }

    async use(preset: CheckoutPagePreset): Promise<void> {
        await this.playwright.usePreset(preset);
    }

    // Abstract low-level HTML identifiers
    async goto(): Promise<void> {
        await this.playwright.goto();
    }

    async placeOrder(): Promise<void> {
        await this.page.locator('id=checkout-payment-continue').click();
    }
}
