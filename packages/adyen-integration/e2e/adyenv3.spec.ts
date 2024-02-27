import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Adyenv3', () => {
    test('Customer should be able to pay using ACH with Adyenv3 through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Adyenv3 ACH in Payment Step');

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('ach');
        await page
            .frameLocator('iframe[title="Iframe for secured bank account number"]')
            .getByPlaceholder('1234 5678 9012 3456 7')
            .fill('123450000');
        await page
            .frameLocator('iframe[title="Iframe for secured bank routing number"]')
            .getByPlaceholder('123456')
            .fill('011000015');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using Credit Card with Adyenv3 in payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Adyenv3 Credit Card in Payment Step');
        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('scheme');
        await page
            .frameLocator('iframe[title="Iframe for secured card number"]')
            .getByPlaceholder('1234 5678 9012 3456')
            .fill('4111 1111 4555 1142');
        await page
            .frameLocator('iframe[title="Iframe for secured card expiry date"]')
            .getByPlaceholder('MM/YY')
            .fill('03/30');
        await page
            .frameLocator('iframe[title="Iframe for secured card security code"]')
            .getByPlaceholder('3 digits')
            .fill('123');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
