import { submitPaymentResult } from '../api.mock';
import { test } from '../testService';

// Uncommmnet to continue in a headed browser
test.use({
    headless: false,
    viewport: { width: 1000, height: 1000 },
});

test.describe('Sample test group', () => {

    test.beforeEach(async ({ testService }) => {
        await testService.gotoPaymentStep({ HAR: 'sample', storeURL: 'https://my-dev-store-745516528.store.bcdev' });
    });

    test('Bigpay Test Payment Provider is working', async ({testService, page}) => {

        if (testService.isReplay) {
            // 2. Serve additional static files with Playwright
            await page.route('**/checkout/payment/hosted-field?**', route => route.fulfill( {status: 200, path: './tests/sampleTests/_support/hostedField.html' } ));

            // 3. Mock API endpoints via Playwright
            await page.route('**/api/public/v1/orders/payments', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(submitPaymentResult)} ));
        }

        // 4. Playwright scripts
        // page.pause() will launch a Playwright inspector in a browser if running in headed mode.
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

        // 5. Assertions
        await testService.shouldSeeOrderConfirmation();
    });
});
