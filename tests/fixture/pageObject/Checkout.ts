import { Page } from '@playwright/test';

import { CheckoutPagePreset, PaymentStepAsGuestPreset } from '../../';

import { PageRoutingRule, PlaywrightHelper } from '.';

export class Checkout {
    private readonly playwright: PlaywrightHelper;
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        this.playwright = new PlaywrightHelper(page);
    }

    async replayPages(files: PageRoutingRule[]): Promise<void> {
        await this.playwright.replayPages(files);
    }

    async goto({ storeURL, harName, preset = new PaymentStepAsGuestPreset(this.page, storeURL) }: { storeURL: string; harName: string; preset?: CheckoutPagePreset }): Promise<void> {
        await this.playwright.goto({
            storeURL,
            harName,
            preset,
        });
    }

    async close(): Promise<void> {
        await this.playwright.stopAll();
    }
}
