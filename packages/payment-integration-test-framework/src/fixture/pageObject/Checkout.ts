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

    // CheckoutFixtures helper, only used in ../CheckoutFixtures.ts
    async close(): Promise<void> {
        await this.playwright.stopAll();
    }

    // Dev helper
    log(): void {
        this.playwright.enableDevMode();
    }

    // Testing environment setup helpers
    async use(preset: CheckoutPagePreset): Promise<void> {
        await this.playwright.usePreset(preset);
    }

    async start(HAR: string): Promise<void> {
        await this.playwright.createHAR(HAR);
    }

    async route(url: string | RegExp | ((url: URL) => boolean), filePath: string, data?: Record<string, unknown>): Promise<void> {
        if (data && typeof data !== 'object') {
            throw new Error('Unable to render data type \''+ typeof data + '\'. Please use object instead.');
        }

        await this.playwright.renderAndRoute(url, filePath, data);
    }

    // Abstract low-level HTML identifiers
    async goto(): Promise<void> {
        await this.playwright.goto();
    }

    async placeOrder(): Promise<void> {
        await this.page.locator('id=checkout-payment-continue').click();
    }
}
