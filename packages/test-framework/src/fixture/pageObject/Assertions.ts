import { expect, Page } from '@playwright/test';

// TODO: more assertions
export class Assertions {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async shouldSeePaymentStep(): Promise<void> {
        const page = this.page;

        await page.locator('id=checkout-payment-continue').waitFor({ state: 'visible' });
        await expect(page.locator('id=checkout-payment-continue')).toBeVisible();
        await expect(page.locator('.checkout-step--payment')).toContainText('Payment');
    }

    async shouldSeeOrderConfirmation(): Promise<void> {
        const page = this.page;

        await page.locator('.orderConfirmation').waitFor({ state: 'visible' });
        await expect(page.locator('data-test=order-confirmation-heading')).toContainText(
            'Thank you',
        );
        await expect(page.locator('data-test=order-confirmation-order-number-text')).toContainText(
            /Your order number is \d*/,
        );
    }

    async shouldSeeErrorModal(errorMessage: string): Promise<void> {
        const page = this.page;

        await page.locator('data-test=modal-body').waitFor({ state: 'visible' });
        await expect(page.locator('data-test=modal-body')).toBeVisible();
        await expect(page.locator('#errorModalMessage')).toHaveText(errorMessage);
    }
}
