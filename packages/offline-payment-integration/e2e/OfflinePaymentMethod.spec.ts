import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Offline payment method', () => {
    test('`Pay in Store` payment method is working', async ({ assertions, checkout }) => {
        // Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Pay in Store');

        // Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('instore');
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('`Cash on Delivery` payment method is working', async ({ assertions, checkout }) => {
        // Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Cash on Delivery');

        // Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('cod');
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
