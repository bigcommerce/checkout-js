import {
    PaymentStepAsGuestPreset,
    test,
} from '@bigcommerce/checkout/payment-integration-test-framework';

test.describe('Sample Test Group', () => {
    test('Bigpay Test Payment Provider is working', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('sample Bigpay Test Payment Provider');

        await checkout.route(
            /https:\/\/bigpay.service.bcdev\/pay\/hosted_forms\/.+\/field?.+|http:\/\/localhost:.+\/checkout\/payment\/hosted-field?.+/,
            `${__dirname}/support/hostedField.ejs`,
        );

        // Playwright actions
        await checkout.goto();
        await page.locator('text=Test Payment ProviderVisaAmexMaster').click();
        await page
            .frameLocator('#bigpaypay-ccNumber iframe')
            .locator('[aria-label="Credit Card Number"]')
            .click();
        await page
            .frameLocator('#bigpaypay-ccNumber iframe')
            .locator('[aria-label="Credit Card Number"]')
            .fill('4111 1111 1111 1111');
        await page
            .frameLocator('#bigpaypay-ccNumber iframe')
            .locator('[aria-label="Credit Card Number"]')
            .press('Tab');
        await page
            .frameLocator('#bigpaypay-ccExpiry iframe')
            .locator('[placeholder="MM \\/ YY"]')
            .fill('11 / 23');
        await page
            .frameLocator('#bigpaypay-ccExpiry iframe')
            .locator('[placeholder="MM \\/ YY"]')
            .press('Tab');
        await page
            .frameLocator('#bigpaypay-ccName iframe')
            .locator('[aria-label="Name on Card"]')
            .fill('BAD ROBOT');
        await page
            .frameLocator('#bigpaypay-ccName iframe')
            .locator('[aria-label="Name on Card"]')
            .press('Tab');
        await page
            .frameLocator('#bigpaypay-ccCvv iframe')
            .locator('[aria-label="CVV"]')
            .fill('111');
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
