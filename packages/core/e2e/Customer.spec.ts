import { CustomerStepPreset, expect, test } from '@bigcommerce/checkout/test-framework';

test.describe('Customer', () => {
    test('Customer Registration Error', async ({ checkout, page }) => {
        await checkout.use(new CustomerStepPreset());
        await checkout.start('Customer Registration Error');

        await checkout.goto();

        await page.locator('[data-test="customer-continue-button"]').click();
        await page.getByRole('link', { name: 'Create an account' }).click();
        await page.locator('[data-test="firstName-text"]').click();
        await page.locator('[data-test="firstName-text"]').fill('John');
        await page.locator('[data-test="firstName-text"]').press('Tab');
        await page.locator('[data-test="lastName-text"]').fill('Citizen');
        await page.locator('[data-test="lastName-text"]').press('Tab');
        await page.locator('[data-test="email-text"]').fill('test@example.com');
        await page.locator('[data-test="password-password"]').click();
        await page.locator('[data-test="password-password"]').fill('password1234');
        await page.locator('[data-test="customer-continue-create"]').click();

        await expect(
            page.getByText(
                'We were not able to complete your spam protection verification. Please try again',
            ),
        ).toBeVisible();
    });
});
