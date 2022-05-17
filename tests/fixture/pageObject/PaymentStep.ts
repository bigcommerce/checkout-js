import { Page } from '@playwright/test';

import { PaymentStepAsGuestPreset, PlaywrightHelper, ReplayConfiguration } from '.';

export default class PaymentStep {
    private readonly playwright: PlaywrightHelper;
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        this.playwright = new PlaywrightHelper(page);
    }

    async replay(replayConfiguration: ReplayConfiguration): Promise<void> {
        this.playwright.replay(replayConfiguration);
    }

    async goto({ storeURL, harName }: { storeURL: string; harName: string }): Promise<void> {
        await this.playwright.goto({
            storeURL,
            harName,
            preset: new PaymentStepAsGuestPreset(this.page, storeURL),
        });
    }

    async close(): Promise<void> {
        await this.playwright.stopAll();
    }
}
