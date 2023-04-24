import {
    PaymentStepAsGuestPreset,
    test,
} from '@bigcommerce/checkout/payment-integration-test-framework';

test.describe.skip('Braintree ACH', () => {
    test('Customer should be able to pay using Braintree ACH', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Braintree ACH in Payment Step');

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('braintreeach');
        await page.locator('[data-test="accountNumber-text"]').fill('1000000000');
        await page.locator('[data-test="routingNumber-text"]').fill('011000015');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
