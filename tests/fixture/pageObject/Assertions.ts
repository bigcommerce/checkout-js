import { expect, Page } from '@playwright/test';

// TODO: more assertions
export default class Assertions {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async shouldSeeOrderConfirmation(): Promise<void> {
        const page = this.page;

        await page.locator('.orderConfirmation').waitFor({state: 'visible'});
        await expect(page.locator('data-test=order-confirmation-heading')).toContainText('Thank you');
        await expect(page.locator('data-test=order-confirmation-order-number-text')).toContainText(/Your order number is \d*/);
    }
}
