import { test } from '../testService';

// Uncommmnet to continue in a headed browser
// test.use({
//     headless: false,
//     viewport: { width: 1000, height: 1000 },
// });

test.describe('Sample Test Group', () => {

    test('Bigpay Test Payment Provider is working', async ({testService, page}) => {

        await testService.gotoPaymentStep({ storeURL: 'https://my-dev-store-745516528.store.bcdev', HAR: 'sample' });

        if (testService.isReplay) {
            await page.route('/checkout/payment/hosted-field?*', route => route.fulfill( {status: 200, path: './tests/sampleTests/_support/hostedField.html' } ));
            await page.route('/api/public/v1/orders/payments', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify({
                    status: 'ok',
                    three_ds_result: {
                        acs_url: null,
                        payer_auth_request: null,
                        merchant_data: null,
                        callback_url: null,
                    },
                    errors: [],
                }
            )}));
        }

        // Playwright scripts
        // await page.pause();
        // Click text=Test Payment ProviderVisaAmexMaster
        await page.locator('text=Test Payment ProviderVisaAmexMaster').click();
        // Click [aria-label="Credit Card Number"]
        await page.frameLocator('#bigpaypay-ccNumber iframe').locator('[aria-label="Credit Card Number"]').click();
        // Fill [aria-label="Credit Card Number"]
        await page.frameLocator('#bigpaypay-ccNumber iframe').locator('[aria-label="Credit Card Number"]').fill('4111 1111 1111 1111');
        // Press Tab
        await page.frameLocator('#bigpaypay-ccNumber iframe').locator('[aria-label="Credit Card Number"]').press('Tab');
        // Fill [placeholder="MM \/ YY"]
        await page.frameLocator('#bigpaypay-ccExpiry iframe').locator('[placeholder="MM \\/ YY"]').fill('11 / 23');
        // Press Tab
        await page.frameLocator('#bigpaypay-ccExpiry iframe').locator('[placeholder="MM \\/ YY"]').press('Tab');
        // Fill [aria-label="Name on Card"]
        await page.frameLocator('#bigpaypay-ccName iframe').locator('[aria-label="Name on Card"]').fill('BAD ROBOT');
        // Press Tab
        await page.frameLocator('#bigpaypay-ccName iframe').locator('[aria-label="Name on Card"]').press('Tab');
        // Fill [aria-label="CVV"]
        await page.frameLocator('#bigpaypay-ccCvv iframe').locator('[aria-label="CVV"]').fill('111');
        // Click text=Place Order
        await page.locator('text=Place Order').click();

        // Assertions
        await testService.shouldSeeOrderConfirmation();
    });
});
