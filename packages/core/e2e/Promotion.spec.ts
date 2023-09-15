import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Shipping with coupon', () => {
    const shippingPriceInvalidErrorMessage = 'The shipping price you were quoted is no longer valid. Click OK to see the most up-to-date shipping prices.';

    test('`Adding and Removing free-shipping coupon` after shipping step is submitted shows shipping error modal', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Adding and Removing free-shipping coupon');

        // Playwright actions
        await checkout.goto();

        // apply coupon and go back to payment step
        await checkout.applyCoupon('FREESHIP');
        await page.locator('data-test=modal-body').waitFor({ state: 'visible' });
        
        // Assertions
        await assertions.shouldSeeErrorModal(shippingPriceInvalidErrorMessage);

        // Playwright actions
        await page.locator('[data-test="modal-footer"] button').click();
        await page.locator('#checkout-shipping-continue').click();

        // refresh page
        await checkout.goto();

        // remove coupon
        await page.locator('[data-test="cart-price-callback"]').click();
        
        // Assertions
        await assertions.shouldSeeErrorModal(shippingPriceInvalidErrorMessage);
    });
    
});
