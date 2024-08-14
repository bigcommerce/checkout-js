import { PaymentStepAsGuestEUPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Digital River', () => {
    test('Customer should be able to pay using CC with Digital River through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        await checkout.use(new PaymentStepAsGuestEUPreset());
        await checkout.start('Digital River Credit Card in Payment Step');

        // Optional: Add mockups.
        await checkout.route(
            /https:\/\/bigpay.service.bcdev\/pay\/hosted_forms\/.+\/field?.+|http:\/\/localhost:.+\/checkout\/payment\/hosted-field?.+/,
            `${__dirname}/support/hostedField.ejs`,
        );
        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"status": "ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data": null,"callback_url": null},"provider_data": null,"errors": []}',
            });
        });
        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('digitalriver');
        await page
            .frameLocator('iframe[title="Secure credit card number input frame"]')
            .getByPlaceholder('1234 5678 9012 3456')
            .fill('3434 567890 12341');
        await page
            .frameLocator('iframe[title="Secure credit card expiration date input frame"]')
            .getByPlaceholder('MM/YY')
            .fill('10/28');
        await page
            .frameLocator('iframe[title="Secure credit card CVV input frame"]')
            .getByPlaceholder('1234')
            .fill('1234');
        await page
            .getByRole('checkbox', {
                name: 'By submitting my order, I agree to the Terms of Sale and the Privacy Policy of Digital River Ireland Ltd.',
            })
            .check();
        await page.getByRole('button', { name: 'Submit Order' }).click();
        await page.waitForLoadState('networkidle');

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using wire transfer with Digital River in payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        await checkout.use(new PaymentStepAsGuestEUPreset());
        await checkout.start('Digital River wire transfer in Payment Step');
        // Optional: Add mockups.
        await checkout.route(
            /https:\/\/bigpay.service.bcdev\/pay\/hosted_forms\/.+\/field?.+|http:\/\/localhost:.+\/checkout\/payment\/hosted-field?.+/,
            `${__dirname}/support/hostedField.ejs`,
        );
        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"status": "ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data": null,"callback_url": null},"provider_data": null,"errors": []}',
            });
        });

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('digitalriver');
        await page.getByRole('button', { name: 'Wire Transfer' }).click();
        await page
            .getByRole('checkbox', {
                name: 'By submitting my order, I agree to the Terms of Sale and the Privacy Policy of Digital River Ireland Ltd.',
            })
            .check();
        await page.getByRole('button', { name: 'Submit Order' }).click();
        await page.waitForLoadState('networkidle');

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
