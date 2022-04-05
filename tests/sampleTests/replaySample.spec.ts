import { expect, test } from '@playwright/test';
import { Polly } from '@pollyjs/core';

import { submitPaymentResult } from '../api.mock';
import { replayInitializer } from '../polly.global.setup';

// Uncommmnet to continue in a headed browser
// test.use({
//     headless: false,
//     viewport: { width: 1000, height: 1000 },
// });

test.describe('Replay mode sample', () => {

    let polly: Polly;

    test.beforeEach(async ({ page }) => {
        // 1. Setup PollyJS
        polly = await replayInitializer({
            playwrightContext: page,
            recordingName: 'sample',
            storeURL: 'https://my-dev-store-745516528.store.bcdev',
        });

        await page.goto('http://localhost:8080/');
    });

    test('Bigpay Test Payment Provider is working', async ({page}) => {

        // 1. Setup PollyJS
        // Since we put it into test.beforeEach(), don't have to initialize again
        // const polly = await replayInitializer({
        //     playwrightContext: page,
        //     recordingName: 'test-recording',
        //     storeURL: 'https://my-dev-store-745516528.store.bcdev',
        // });

        // 2. Serve additional static files with Playwright
        await page.route('**/checkout/payment/hosted-field?**', route => route.fulfill( {status: 200, path: './tests/sampleTests/_support/hostedField.html' } ));

        // 3. Mock API endpoints via Playwright
        await page.route('**/api/public/v1/orders/payments', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(submitPaymentResult)} ));

        // 4. Playwright scripts
        // This will bring out a Playwright inspector in a headed browser
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
        await page.locator('.orderConfirmation').waitFor({state: 'visible'});

        // 5. Assertions
        await expect(page.locator('data-test=order-confirmation-heading')).toContainText('Thank you');
        await expect(page.locator('data-test=order-confirmation-order-number-text')).toContainText(/Your order number is \d*/);

        // 6. Close PollyJS and Playwright
        await polly.stop();
        await page.close();

    });
});
