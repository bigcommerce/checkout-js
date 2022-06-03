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

    log(): void {
        this.playwright.enableDevMode();
    }

    async use(preset: CheckoutPagePreset): Promise<void> {
        await this.playwright.usePreset(preset);
    }

    async close(): Promise<void> {
        await this.playwright.stopAll();
    }

    async create(har: string, storeURL: string): Promise<void> {
        await this.playwright.createCheckout(har, storeURL);
    }

    async route(url: string | RegExp | ((url: URL) => boolean), filePath: string, data?: {}): Promise<void> {
        await this.playwright.routeAndRender(url, filePath, data);
    }

    // Abstract low-level HTML identifiers
    async goto(): Promise<void> {
        await this.playwright.goto();
    }

    async placeOrder(): Promise<void> {
        await this.page.locator('id=checkout-payment-continue').click();
    }
}
