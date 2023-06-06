import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('BlueSnap Direct', () => {
    test('Customer should be able to pay using ECP/ACH with BlueSnap through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('ECP with BlueSnap in Payment Step');
        // Optional: Add mockups.
        await checkout.route(
            /https:\/\/bigpay.service.bcdev\/pay\/hosted_forms\/.+\/field?.+|http:\/\/localhost:.+\/checkout\/payment\/hosted-field?.+/,
            `${__dirname}/support/hostedField.ejs`,
        );

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('ecp');
        await page.locator('[data-test="accountNumber-text"]').fill('223344556');
        await page.locator('[data-test="routingNumber-text"]').fill('998877665');
        await page.locator('[data-test="accountType-select"]').selectOption('CONSUMER_CHECKING');
        await page.locator('[for="shopperPermission"]').click();
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
