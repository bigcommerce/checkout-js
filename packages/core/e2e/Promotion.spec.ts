import { AddCouponPreset, PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Shipping with coupon', () => {
    const shippingPriceInvalidErrorMessage = 'The shipping price you were quoted is no longer valid. Click OK to see the most up-to-date shipping prices.';

    test('`Adding free-shipping coupon` after shipping step is submitted shows shipping error modal', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Adding free-shipping coupon');

        // Playwright actions
        await checkout.goto();
        await checkout.applyCoupon('FREESHIP');

        // Assertions
        await assertions.shouldSeeErrorModal(shippingPriceInvalidErrorMessage);
    });

    test('`Removing free-shipping coupon` after shipping step is submitted shows shipping error modal', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset('FREESHIP'));
        await checkout.start('Removing free-shipping coupon');

        // Playwright actions
        await checkout.goto();
        await checkout.removeCoupon();
        
        // Assertions
        await assertions.shouldSeeErrorModal(shippingPriceInvalidErrorMessage);
    });
    
});
