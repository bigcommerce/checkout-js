import { Page } from '@playwright/test';

import { CheckoutPagePreset } from '../../';

import { PlaywrightHelper } from '.';

export class Checkout {
    private readonly page: Page;
    private readonly playwright: PlaywrightHelper;
    private harFileName = '';
    private harFolderPath = '';

    constructor(page: Page) {
        this.page = page;
        this.playwright = new PlaywrightHelper(page);
    }

    // CheckoutFixtures helper, only used in ../CheckoutFixtures.ts
    async setHarFolderPath(file:string): void {
        const regex = /packages(.+)e2e\//g;
        const currentTestFilePath = regex.exec(file);

        if (!currentTestFilePath) {
            throw new Error('Unable to create HAR file. Please place the test file in a package\'s \'e2e\' folder.');
        }

        const harFolderName = `__har__`;
        this.harFolderPath = `./${currentTestFilePath[0]}${harFolderName}`;
    }

    async close(): Promise<void> {
        if (!this.harFileName) {
            throw new Error('Unable to run the test. Please use checkout.start() helper function.');
        }
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
        this.harFileName = HAR;
        await this.playwright.useHAR(HAR, this.harFolderPath);
    }

    async route(url: string | RegExp | ((url: URL) => boolean), filePath: string, data?: Record<string, unknown>): Promise<void> {
        if (data && typeof data !== 'object') {
            throw new Error('Unable to render data type \''+ typeof data + '\'. Please use \'object\' as data type.');
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
