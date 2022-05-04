import { expect, Page } from '@playwright/test';

// TODO: more assertions
export default class AssertionsHelper {
    private readonly _page: Page;

    constructor(page: Page) {
        this._page = page;
    }

    async shouldSeeOrderConfirmation(): Promise<void> {
        const page = this._page;

        await page.locator('.orderConfirmation').waitFor({state: 'visible'});
        await expect(page.locator('data-test=order-confirmation-heading')).toContainText('Thank you');
        await expect(page.locator('data-test=order-confirmation-order-number-text')).toContainText(/Your order number is \d*/);
    }
}
