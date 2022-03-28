import { chromium, expect, test } from '@playwright/test';
import { Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';
import path from 'path';
import { PlaywrightAdapter } from 'polly-adapter-playwright';

// dirty hack for root certificate issue during recording HAR
// https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Uncommmnet to continue in a headed browser
// test.use({
//     headless: false,
//     viewport: { width: 1000, height: 1000 },
// });

test.describe('Checkout', () => {

    test('Credit card payment is working', async () => {

        const browser = await chromium.launch();
        const page = await browser.newPage();

        // Setup PollyJS
        Polly.register(PlaywrightAdapter);
        Polly.register(FSPersister);
        const polly = new Polly('checkout', {
            mode: 'replay',
            // logLevel: 'info',
            adapters: ['playwright'],
            adapterOptions: {
                playwright: {
                    context: page,
                },
            },
            persister: 'fs',
        });
        polly.configure({
            persisterOptions: {
                fs: {
                    recordingsDir: path.join(__dirname, '../_har/'),
                },
            },
            matchRequestsBy: {
                headers: false,
                url: true,
                order: false,
            },
        });

        // Intercept Bigpay, not sure why (only) this cannot be replayed, always seeing a 405 error.
        polly.server.post('http://localhost:8080/api/public/v1/orders/payments').intercept((_, res) => {
            res.status(200);
            res.setHeaders({
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Origin': '*',
            });
            res.json({
                status: 'ok',
                three_ds_result: {
                    acs_url: null,
                    payer_auth_request: null,
                    merchant_data: null,
                    callback_url: null,
                },
                errors: [],
            });
        });
        // Convert localhost URL to dev store, so HAR file can replay them
        polly.server.any().on('request', req => {
            req.url = req.url.replace('http://localhost:8080', 'https://my-dev-store-745516528.store.bcdev');
        });

        // Serving static files through Playwright
        await page.route('/', route => route.fulfill( {status: 200, path: './tests/_support/index.html' } ));
        await page.route('**/checkout/payment/hosted-field?**', route => route.fulfill( {status: 200, path: './tests/_support/hostedField.html' } ));
        await page.route('**/order-confirmation', route => route.fulfill( {status: 200, path: './tests/_support/orderConfirmation.html' } ));
        await page.route('**/ablebrewingsystem4.1647253530.190.285.jpg?c=1', route => route.fulfill( {status: 200, path: './tests/_support/product.gif' } ));

        // Playwright scripts
        await page.goto('http://localhost:8080/');
        // await page.goto('https://my-dev-store-745516528.store.bcdev/');
        // Click [data-test="card-86"] >> text=Add to Cart
        // await page.locator('[data-test="card-86"] >> text=Add to Cart').click();
        // assert.equal(page.url(), 'https://my-dev-store-745516528.store.bcdev/cart.php?suggest=ae7a82e0-fd10-4df5-9dc3-f23a7f5c5aa2');
        // Click text=Check out
        // await page.locator('text=Check out').click();
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

        // Assertion for this test
        await expect(page.locator('.orderConfirmation')).toContainText('Your order number is');

        await page.pause();

        // Clean up
        await polly.stop();
        await page.close();
    });
});
