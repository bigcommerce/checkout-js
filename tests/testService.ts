import { expect , test as base, Page } from '@playwright/test';
import { Polly } from '@pollyjs/core';

import { pollyInitializer } from './polly.global.setup';

class TestService {
    readonly page: Page;
    polly: Polly | undefined;

    constructor(page: Page) {
        this.page = page;
    }

    async useHAR(name:string) {
        this.polly = await pollyInitializer({
            playwrightContext: this.page,
            recordingName: name,
            storeURL: 'https://my-dev-store-745516528.store.bcdev',
        });

        return this.polly;
    }

    async goto() {
        await this.page.goto('https://playwright.dev');
    }
}

interface CheckoutFixtures {
    testService: TestService;
}

export const test = base.extend<CheckoutFixtures>({
    testService: async ({ page }, use) => {
        // Set up the fixture.
        const testService = new TestService(page);

        // Use the fixture value in the test.
        await use(testService);

        // Clean up the fixture.
        await testService.polly?.stop();
        await page.close();
    },
});

export { expect };
