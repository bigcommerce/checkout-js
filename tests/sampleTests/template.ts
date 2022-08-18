import { test, PaymentStepAsGuestPreset } from '../';

test.describe('xxxxxxxxxxxxxxxxxxxxxxx', () => {
    test('xxxxxxxxxxxxxxxxxxxxxxx', async ({ assertions, checkout }) => {
        // Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('name of the HAR file, which can be reused');
        // await checkout.route('https://pay.google.com/gp/p/js/pay.js', './tests/sampleTests/support/googlePay.mock.js');
        // await page.route(/.*\/api\/storefront\/orders\/390.*/, route => route.fulfill({...responseProps, body: order390 }));

        // Playwright actions
        await checkout.goto();
        // await page.locator('text=Test Payment ProviderVisaAmexMaster').click();
        // await page.frameLocator('#bigpaypay-ccNumber iframe').locator('[aria-label="Credit Card Number"]').click();
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
