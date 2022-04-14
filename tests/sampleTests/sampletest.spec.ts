import { expect, test } from '@playwright/test';
import { Polly } from '@pollyjs/core';

import { submitPaymentResult } from '../api.mock';
import { pollyInitializer } from '../polly.global.setup';

// Uncommmnet to continue in a headed browser
// test.use({
//     headless: false,
//     viewport: { width: 1000, height: 1000 },
// });

test.describe('Sample test group', () => {

    let polly: Polly;

    test.beforeEach(async ({ page }) => {
        polly = await pollyInitializer({
            playwrightContext: page,
            recordingName: 'sample',
            storeURL: 'https://my-dev-store-745516528.store.bcdev',
        });

        await page.goto('/');
    });

    test.afterEach(async ({ page }) => {
        await polly.stop();
        await page.close();
    });

    test('@record Bigpay Test Payment Provider is working', async ({page}) => {
        test.skip(process.env.MODE === 'replay');
        // Launch local checkout page
        await page.goto('https://my-dev-store-745516528.store.bcdev');
        // Click [data-test="card-86"] >> text=Add to Cart
        await page.locator('[data-test="card-86"] >> text=Add to Cart').click();
        // assert.equal(page.url(), 'https://my-dev-store-745516528.store.bcdev/cart.php?suggest=ae7a82e0-fd10-4df5-9dc3-f23a7f5c5aa2');
        // Click text=Check out
        await page.locator('text=Check out').click();
        // assert.equal(page.url(), 'https://my-dev-store-745516528.store.bcdev/checkout');
        // Fill input[name="email"]
        await page.locator('input[name="email"]').fill('test@robot.com');
        // Click [data-test="customer-continue-as-guest-button"]
        await page.locator('[data-test="customer-continue-as-guest-button"]').click();
        // Fill [data-test="firstNameInput-text"]
        await page.locator('[data-test="firstNameInput-text"]').fill('BAD');
        // Press Tab
        await page.locator('[data-test="firstNameInput-text"]').press('Tab');
        // Fill [data-test="lastNameInput-text"]
        await page.locator('[data-test="lastNameInput-text"]').fill('ROBOT');
        // Click [data-test="addressLine1Input-text"]
        await page.locator('[data-test="addressLine1Input-text"]').click();
        // Fill [data-test="addressLine1Input-text"]
        await page.locator('[data-test="addressLine1Input-text"]').fill('1000 5TH Ave');
        // Fill [data-test="cityInput-text"]
        await page.locator('[data-test="cityInput-text"]').fill('NEW YORK');
        // Select US
        await page.locator('[data-test="countryCodeInput-select"]').selectOption('US');
        // Select NY
        await page.locator('[data-test="provinceCodeInput-select"]').selectOption('NY');
        // Click [data-test="postCodeInput-text"]
        await page.locator('[data-test="postCodeInput-text"]').click();
        // Fill [data-test="postCodeInput-text"]
        await page.locator('[data-test="postCodeInput-text"]').fill('10028');
        // Click text=Continue
        await page.locator('text=Continue').click();
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
        await polly.stop();
        await page.close();
    });

    test('Bigpay Test Payment Provider is working', async ({page}) => {
        // 2. Serve additional static files with Playwright
        await page.route('**/checkout/payment/hosted-field?**', route => route.fulfill( {status: 200, path: './tests/sampleTests/_support/hostedField.html' } ));

        // 3. Mock API endpoints via Playwright
        await page.route('**/api/public/v1/orders/payments', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(submitPaymentResult)} ));

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
        await page.locator('.orderConfirmation').waitFor({state: 'visible'});

        // 5. Assertions
        await expect(page.locator('data-test=order-confirmation-heading')).toContainText('Thank you');
        await expect(page.locator('data-test=order-confirmation-order-number-text')).toContainText(/Your order number is \d*/);
    });
});
