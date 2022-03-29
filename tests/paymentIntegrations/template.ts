import { chromium, expect, test } from '@playwright/test';
import { Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';
import path from 'path';
import { PlaywrightAdapter } from 'polly-adapter-playwright';

// dirty hack for root certificate issue during recording HAR
// https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs
// #recordStepOnly
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// commmnet out below to continue in a headless browser
test.use({
    headless: false,
    viewport: { width: 1000, height: 1000 },
});

test.describe('group name', () => {

    test('test name #1', async () => {

        const browser = await chromium.launch();
        const page = await browser.newPage();

        // Setup PollyJS
        Polly.register(PlaywrightAdapter);
        Polly.register(FSPersister);
        const polly = new Polly('sample', {
            mode: 'record', // #recordStepOnly
            // mode: 'replay',
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

        // #replayStep
        // Do you need an API call to be intercepted?
        // polly.server.post('http://localhost:8080/api/public/v1/orders/payments').intercept((_, res) => {
        //     res.status(200);
        //     res.setHeaders({
        //         'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        //         'Access-Control-Allow-Origin': '*',
        //     });
        //     res.json({
        //         status: 'ok',
        //         three_ds_result: {
        //             acs_url: null,
        //             payer_auth_request: null,
        //             merchant_data: null,
        //             callback_url: null,
        //         },
        //         errors: [],
        //     });
        // });

        // #replayStep
        // Convert localhost URLs to the dev store URLs, so HAR file can replay them
        // polly.server.any().on('request', req => {
        //     req.url = req.url.replace('http://localhost:8080', 'https://my-dev-store-745516528.store.bcdev');
        // });

        // #replayStep
        // Serving static files through Playwright
        // await page.route('/', route => route.fulfill( {status: 200, path: './tests/_support/index.html' } ));
        // await page.route('**/checkout/payment/hosted-field?**', route => route.fulfill( {status: 200, path: './tests/_support/hostedField.html' } ));
        // await page.route('**/order-confirmation', route => route.fulfill( {status: 200, path: './tests/_support/orderConfirmation.html' } ));
        // await page.route('**/ablebrewingsystem4.1647253530.190.285.jpg?c=1', route => route.fulfill( {status: 200, path: './tests/_support/product.gif' } ));

        // Playwright scripts

        // #replayStep
        // await page.goto('http://localhost:8080');
        // #recordStep
        await page.goto('http://YOUR_DEV_STORE');

        await page.pause();

        // Assertion for this test
        await expect(page.locator('data-test=order-confirmation-heading')).toContainText('Thank you');
        await expect(page.locator('data-test=order-confirmation-order-number-text')).toContainText(/Your order number is \d*/);

        // Clean up
        await polly.stop();
        await page.close();
    });
});
