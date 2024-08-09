import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Bolt Embedded', () => {
    test('Customer should be able to pay using Bolt Embedded through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Bolt Embedded One Click Checkout');

        const orderPayment =
            '{"status":"ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data":null,"callback_url":null},"errors":[]}';

        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: orderPayment,
            });
        });
        // Playwright actions
        await checkout.goto();

        await page
            .frameLocator('#credit-card-input')
            .getByPlaceholder('Card number')
            .fill('4111  1111  1111  1111');
        await page
            .frameLocator('#credit-card-input')
            .getByPlaceholder('Expiration (MM/YY)')
            .fill('08 / 29');
        await page.frameLocator('#credit-card-input').getByPlaceholder('CVV').fill('111');

        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
