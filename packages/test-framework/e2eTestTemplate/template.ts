// checkout-js e2e testing documentation: [placeholder].
// Uncomment below to start.

// import { test, PaymentStepAsGuestPreset } from '@bigcommerce/checkout/test-framework';

// test.describe('xxxxxxxxxxxxxxxxxxxxxxx', () => {
//     test('xxxxxxxxxxxxxxxxxxxxxxx', async ({assertions, checkout, page}) => {
//         // 1. Testing environment setup
//         await checkout.use(new PaymentStepAsGuestPreset());
//         await checkout.start('name of the HAR file, which can be reused');
//         // Optional: Add mockups.
//         // await checkout.route('https://pay.google.com/gp/p/js/pay.js', './packages/e2e/src/sampleTests/support/googlePay.mock.js');
//         // await page.route(/.*\/api\/storefront\/orders\/390.*/, route => route.fulfill({...responseProps, body: order390 }));
//
//         // 2. Playwright actions
//         await checkout.goto();
//         await page.pause();
//         // await page.locator('text=Test Payment ProviderVisaAmexMaster').click();
//         // await page.frameLocator('#bigpaypay-ccNumber iframe').locator('[aria-label="Credit Card Number"]').click();
//         await checkout.placeOrder();
//
//         // 3. Assertions
//         await assertions.shouldSeeOrderConfirmation();
//     });
// });
