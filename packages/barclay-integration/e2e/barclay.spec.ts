import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Offsite payment method', () => {
    test('Barclay is working', async ({ assertions, checkout }) => {
        // Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Barclay');
        await checkout.route('**/pay/initialize', `${__dirname}/support/barclay.ejs`);

        // Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('credit_card');
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
