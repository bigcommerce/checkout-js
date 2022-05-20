import { test, PaymentStepAsGuestPreset } from '../';

test.describe('Sample Test Group', () => {
    test('Bigpay test payment rredit card is working', async ({assertions, checkout, page}) => {
        const storeURL = 'https://my-dev-store-745516528.store.bcdev';
        const preset = new PaymentStepAsGuestPreset(page, storeURL);
        await checkout.goto({storeURL, harName: 'sample Bigpay test payment rredit card', preset});
        await checkout.replayPages([{
            routePath: '/checkout/payment/hosted-field?*',
            filePath: './tests/sampleTests/support/hostedField.ejs',
        }]);

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
