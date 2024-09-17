import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('SquareV2', () => {
    test('Customer should be able to pay using SquareV2 through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('SquareV2 in Payment Step');
        // Optional: Add mockups.
        await checkout.route(
            'https://sandbox.web.squarecdn.com/v1/square.js',
            `${__dirname}/support/square.mock.js`,
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
        await page.locator('#squarev2_fake_input').fill('4111-1111-1111-1111');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
