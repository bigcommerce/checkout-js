import { Page } from '@playwright/test';

import { CheckoutPagePreset } from '../../';

import { PlaywrightHelper } from '.';

export class Checkout {
    private readonly page: Page;
    private readonly playwright: PlaywrightHelper;
    private harFileName = '';
    private harFolderPath = '';
    private openedCheckout = false;
    private usedPreset = false;

    constructor(page: Page) {
        this.page = page;
        this.playwright = new PlaywrightHelper(page);
    }

    // CheckoutFixtures helper, only used in ../CheckoutFixtures.ts
    setHarFolderPath(file: string): void {
        const regex = /packages(.+)e2e\//g;
        const currentTestFilePath = regex.exec(file);

        if (!currentTestFilePath) {
            throw new Error(
                "Unable to create HAR file. Please place the test file in a package's 'e2e' folder.",
            );
        }

        const harFolderName = `__har__`;

        this.harFolderPath = `./${currentTestFilePath[0]}${harFolderName}`;
    }

    async close(): Promise<void> {
        if (!this.harFileName || !this.usedPreset || !this.openedCheckout) {
            throw new Error(
                'Unable to run the test. Please use all three essential helper functions: checkout.use(), checkout.start(), checkout.goto().',
            );
        }

        await this.playwright.stopAll();
    }

    // Dev helper
    log(): void {
        this.playwright.enableDevMode();
    }

    // Testing environment setup helpers
    async use(preset: CheckoutPagePreset): Promise<void> {
        this.usedPreset = true;
        await this.playwright.usePreset(preset);
    }

    async start(har: string): Promise<void> {
        this.harFileName = har;
        await this.playwright.useHAR(har, this.harFolderPath);
    }

    async route(
        url: string | RegExp | ((url: URL) => boolean),
        filePath: string,
        data?: Record<string, unknown>,
    ): Promise<void> {
        if (data && typeof data !== 'object') {
            throw new Error(
                `Unable to render data type '${typeof data}'. Please use 'object' as data type.`,
            );
        }

        await this.playwright.renderAndRoute(url, filePath, data);
    }

    // Abstract low-level HTML identifiers
    async goto(): Promise<void> {
        this.openedCheckout = true;
        await this.playwright.goto();
    }

    async selectPaymentMethod(methodId: string): Promise<void> {
        await this.page.locator(`[data-test=payment-method-${methodId}]`).click();
    }

    async placeOrder(): Promise<void> {
        await this.page.locator('id=checkout-payment-continue').click();
    }
}
