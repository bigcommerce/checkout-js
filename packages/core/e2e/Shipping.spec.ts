import { AddItemToCartPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Shipping', () => {
    test('`Shipping with Guest checkout`', async ({ assertions, checkout }) => {
        // Testing environment setup
        await checkout.use(new AddItemToCartPreset());
        await checkout.start('Shipping with Guest checkout');

        // Playwright actions
        await checkout.goto();
        await checkout.completeCustomerStepAsGuest();
        await checkout.completeShippingAddressForm();

        // Assertions
        await assertions.shouldSeePaymentStep();
    });

    test('`Shipping with Guest checkout with different billing address`', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await checkout.use(new AddItemToCartPreset());
        await checkout.start('Shipping with different billing address');

        // Playwright actions
        await checkout.goto();
        await checkout.completeCustomerStepAsGuest();
        await checkout.completeShippingAddressForm(false);
        await checkout.completeBillingAddressForm();

        // Assertions
        await assertions.shouldSeePaymentStep();

    });

    test('`Shipping with Customer checkout`', async ({ assertions, checkout }) => {
        // Testing environment setup
        await checkout.use(new AddItemToCartPreset());
        await checkout.start('Shipping with Customer checkout');

        // Playwright actions
        await checkout.goto();
        await checkout.completeCustomerStep("test@example.com", "test@123");
        await checkout.completeShippingAddressForm(true, false);

        // Assertions
        await assertions.shouldSeePaymentStep();
    });

    test('`Multi Shipping with Customer checkout`', async ({ assertions, checkout }) => {
        // Testing environment setup
        await checkout.use(new AddItemToCartPreset(2));
        await checkout.start('Multi Shipping with Customer checkout');

        // Playwright actions
        await checkout.goto();
        await checkout.completeCustomerStep("test1@example.com", "test@123");
        await checkout.completeMultiShippingAddressForm();

        // Assertions
        await assertions.shouldSeePaymentStep();
    });
});