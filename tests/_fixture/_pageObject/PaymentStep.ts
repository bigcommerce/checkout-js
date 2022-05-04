import { Page } from '@playwright/test';

import { AssertionsHelper, CheckoutPresets, PlaywrightHelper } from '.';

export default class PaymentStep {
    isReplay: boolean;
    assertions: AssertionsHelper;
    private _playwright: PlaywrightHelper;

    constructor(page: Page) {
        this.isReplay = process.env.MODE?.toLowerCase() === 'replay';
        this.assertions = new AssertionsHelper(page);
        this._playwright = new PlaywrightHelper(page);
    }

    async goto({ storeURL, harName }: { storeURL: string; harName: string }): Promise<void> {
        await this._playwright.goto({ storeURL, harName, preset: CheckoutPresets.PaymentStepAsGuest });
    }

    async close(): Promise<void> {
        await this._playwright.stopAll();
    }
}
