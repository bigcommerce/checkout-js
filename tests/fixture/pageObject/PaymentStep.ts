import { Page } from '@playwright/test';

import { AssertionsHelper, CheckoutPresets, PlaywrightHelper } from '.';

export default class PaymentStep {
    assertions: AssertionsHelper;
    isReplay: boolean;
    private playwright: PlaywrightHelper;

    constructor(page: Page) {
        this.assertions = new AssertionsHelper(page);
        this.isReplay = process.env.MODE?.toLowerCase() === 'replay';
        this.playwright = new PlaywrightHelper(page);
    }

    async goto({ storeURL, harName }: { storeURL: string; harName: string }): Promise<void> {
        await this.playwright.goto({ storeURL, harName, preset: CheckoutPresets.PaymentStepAsGuest });
    }

    async close(): Promise<void> {
        await this.playwright.stopAll();
    }
}
