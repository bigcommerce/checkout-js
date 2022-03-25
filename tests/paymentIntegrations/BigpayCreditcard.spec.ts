import { chromium, expect, Page, test } from '@playwright/test';
import { Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';
import { PlaywrightAdapter } from 'polly-adapter-playwright';

// dirty hack for root certificate issue
// https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const path = require('path');

test.use({
    headless: false,
    viewport: { width: 1000, height: 1000 },
});

// test.beforeEach(async ({ page }) => {
// });

test.describe('Checkout', () => {

    test('Credit card payment is working', async () => {

        const browser = await chromium.launch();
        const page = await browser.newPage();

        // register the playwright adapter so it's accessible by all future polly instances
        Polly.register(PlaywrightAdapter);
        Polly.register(FSPersister);

        const polly = new Polly('checkout', {
            mode: 'replay',
            logLevel: 'error',
            adapters: ['playwright'],
            adapterOptions: {
                playwright: {
                    context: page,
                },
            },
            persister: 'fs',
        });
        // polly.server.any().on('beforeReplay', (req, recording) => {
        //     console.log("REPLAY!!!!!!!", recording);
        // });
        polly.server.any().on('request', (req) => {
            req.url = req.url.replace('http://localhost:8080/api/public/v1/orders/payments', 'https://bigpay.service.bcdev/api/public/v1/orders/payments');
            req.url = req.url.replace('http://localhost:8080', 'https://my-dev-store-745516528.store.bcdev');
            console.log("😃 "+req.url);
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

        polly.server.any().on('beforeResponse', (req, res) => {
            console.log(req,res);
        });

        await page.route('/', route => route.fulfill( {status: 200, path: './tests/_support/index.html' } ));
        await page.route('**/checkout/payment/hosted-field?**', route => route.fulfill( {status: 200, path: './tests/_support/hostedField.html' } ));
        await page.route('**/order-confirmation', route => route.fulfill( {status: 200, path: './tests/_support/orderConfirmation.html' } ));


        // await page.goto('https://my-dev-store-745516528.store.bcdev/');
        await page.goto('http://localhost:8080/');
        // await page.pause();

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

        await expect(page.locator('.orderConfirmation')).toContainText('Your order number is');

        await page.pause();

        // cleanup
        await polly.stop();
        await page.close();
    });
});
