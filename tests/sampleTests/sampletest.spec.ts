import { test } from '../';

test.describe('Sample Test Group', () => {
    test('Bigpay Test Payment Provider is working', async ({assertions, paymentStep, page}) => {
        await paymentStep.goto({storeURL: 'https://my-dev-store-745516528.store.bcdev', harName: 'sample '});
        await paymentStep.replay({
            file: [{
                routePath: '/checkout/payment/hosted-field?*',
                filePath: './tests/sampleTests/support/hostedField.ejs',
            }],
            json: [{
                routePath: '/api/public/v1/orders/payments',
                data: {
                    status: 'ok',
                    three_ds_result: {
                        acs_url: null,
                        payer_auth_request: null,
                        merchant_data: null,
                        callback_url: null,
                    },
                    errors: [],
                },
            }],
        });

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
        await assertions.shouldSeeOrderConfirmation();
    });
});
