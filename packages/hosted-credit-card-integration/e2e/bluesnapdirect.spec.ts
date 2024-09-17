import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('BlueSnap Direct', () => {
    test('Customer should be able to pay using CC with BlueSnap through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('CC with BlueSnap in Payment Step');
        // Optional: Add mockups.
        await checkout.route(
            /https:\/\/bigpay.service.bcdev\/pay\/hosted_forms\/.+\/field?.+|http:\/\/localhost:.+\/checkout\/payment\/hosted-field?.+/,
            `${__dirname}/support/hostedField.ejs`,
        );
        await checkout.route(
            'https://sandpay.bluesnap.com/web-sdk/5/bluesnap.js',
            `${__dirname}/support/bluesnap.mock.js`,
        );
        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"status":"ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data":null,"callback_url":null},"provider_data":null,"errors":[]}',
            });
        });

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('credit_card');
        await page.locator('[data-bluesnap="ccn"]').locator('input').fill('4111-1111-1111-1111');
        await page.locator('[data-bluesnap="exp"]').locator('input').fill('12/23');
        await page.locator('[data-bluesnap="cvv"]').locator('input').fill('123');
        await page.locator('[data-bluesnap="noc"]').locator('input').fill('John Doe');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
