import { AddCouponPreset, PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Shipping with coupon', () => {
    test('`Adding coupon` after shipping step is submitted shows shipping error modal', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Adding coupon');

        // Playwright actions
        await checkout.goto();
        await checkout.applyCoupon('FREESHIP');

        // Assertions
        await assertions.shouldSeeErrorModal();
    });

    test('`Removing coupon` after shipping step is submitted shows shipping error modal', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await checkout.use(new AddCouponPreset());
        await checkout.start('Removing coupon');

        // Playwright actions
        await checkout.goto();
        await checkout.removeCoupon();
        
        // Assertions
        await assertions.shouldSeeErrorModal();
    });
    
});
