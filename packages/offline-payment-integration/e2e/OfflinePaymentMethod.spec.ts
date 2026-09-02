import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

import { mockGooglePayStripeUpeConfig } from './support/googlePayStripeUpeMock';

test.describe('Offline payment method', () => {
    test('`Pay in Store` payment method is working', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Pay in Store');
        await mockGooglePayStripeUpeConfig(page);

        // Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('instore');
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('`Cash on Delivery` payment method is working', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Cash on Delivery');
        await mockGooglePayStripeUpeConfig(page);

        // Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('cod');
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
