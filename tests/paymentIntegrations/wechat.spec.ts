import { chromium, expect, test } from '@playwright/test';
import { Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';
import path from 'path';
import { PlaywrightAdapter } from 'polly-adapter-playwright';

// dirty hack for root certificate issue during recording HAR
// https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// commmnet out below to continue in a headless browser
test.use({
    headless: false,
    viewport: { width: 1000, height: 1000 },
});

test.describe('Adyen', () => {

    test('wechat pay is working', async () => {

        const browser = await chromium.launch();
        const page = await browser.newPage();

        // Setup PollyJS
        Polly.register(PlaywrightAdapter);
        Polly.register(FSPersister);
        const polly = new Polly('sample', {
            // mode: 'record',
            mode: 'replay',
            logLevel: 'info',
            adapters: ['playwright'],
            adapterOptions: {
                playwright: {
                    context: page,
                },
            },
            persister: 'fs',
            recordFailedRequests: true,
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

        // Do you need an API call to be intercepted?
        polly.server.post('https://bigpay.service.bcdev/api/public/v1/orders/payments').intercept((_, res) => {
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

        // Convert localhost URLs to the dev store URLs, so HAR file can replay them
        polly.server.any().on('request', req => {
            req.url = req.url.replace('http://localhost:8080', 'https://my-dev-store-745516528.store.bcdev');
        });

        // Serving static files through Playwright
        await page.route('/', route => route.fulfill( {status: 200, path: './tests/_support/index.wechat.html' } ));
        await page.route('**/order-confirmation', route => route.fulfill( {status: 200, path: './tests/_support/orderConfirmation.wechat.html' } ));
        await page.route('**/ablebrewingsystem4.1647253530.190.285.jpg?c=1', route => route.fulfill( {status: 200, path: './tests/_support/product.gif' } ));

        // Playwright scripts
        // await page.goto('https://my-dev-store-745516528.store.bcdev/');
        await page.goto('http://localhost:8080');
        // // Click [data-test="card-86"] >> text=Add to Cart
        // await page.locator('[data-test="card-86"] >> text=Add to Cart').click();
        // // assert.equal(page.url(), 'https://my-dev-store-745516528.store.bcdev/cart.php?suggest=cfa7273c-0976-4602-9cec-220b8ab6d308');
        // // Click text=Check out
        // await page.locator('text=Check out').click();
        // // assert.equal(page.url(), 'https://my-dev-store-745516528.store.bcdev/checkout');
        // Click input[name="email"]
        await page.locator('input[name="email"]').click();
        // Click [data-test="customer-continue-button"]
        await page.locator('[data-test="customer-continue-button"]').click();
        // Click input[name="email"]
        await page.locator('input[name="email"]').click();
        // Fill input[name="email"]
        await page.locator('input[name="email"]').fill('Selena.Gomez@building.com');
        // Click input[name="password"]
        await page.locator('input[name="password"]').click();
        // Fill input[name="password"]
        await page.locator('input[name="password"]').fill('pzZweam34vyP');
        // Click [data-test="customer-continue-button"]
        await page.locator('[data-test="customer-continue-button"]').click();
        // Click label:has-text("Pickup In Store$0.00")
        await page.locator('label:has-text("Pickup In Store$0.00")').click();
        // Click text=Continue
        await page.locator('text=Continue').click();
        // Click label:has-text("WeChat Pay")
        await page.locator('label:has-text("WeChat Pay")').click();
        // Click text=Place Order
        // await page.pause();
        await page.locator('text=Place Order').click();

        // await expect(page.locator('.orderConfirmation')).toContainText('Scan QR code');

        // Assertion for this test
        await expect(page.locator('data-test=order-confirmation-order-number-text')).toContainText(/Your order number is \d*/);

        // Clean up
        await polly.stop();
        await page.close();
    });
});
