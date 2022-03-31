import { test } from '@playwright/test';

import { recordInitializer, replayInitializer } from '../polly.global.setup';

// Uncommmnet to continue in a headed browser
// test.use({
//     headless: false,
// });

test.describe('xxxxxxxxxxxxxxxxxxxxxxx', () => {

    // 1. Test preparation stage
    test('record a HAR', async ({page}) => {

        // 1. Setup PollyJS
        const polly = recordInitializer({
            playwrightContext: page,
            recordingName: 'xxxxxxxxxxxxxxxxxxxxxxx',
        });

        // 2. Serve additional static files with Playwright
        // await page.route('**/checkout/payment/hosted-field?**', route => route.fulfill( {status: 200, path: './tests/_support/hostedField.html' } ));

        // 3. Mock API endpoints via Playwright
        // await page.route('**/api/public/v1/orders/payments', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify({})} ));

        // 4. Playwright scripts
        await page.goto('http://localhost:8080/');
        await page.pause();

        // 5. Assertions
        // await expect(page.locator('data-test=order-confirmation-heading')).toContainText('Thank you');

        // 6. Close PollyJS and Playwright
        await polly.stop();
        await page.close();
    });

    // 2. Test execution stage
    test('replay a HAR', async ({page}) => {

        // 1. Setup PollyJS
        const polly = replayInitializer({
            playwrightContext: page,
            recordingName: 'xxxxxxxxxxxxxxxxxxxxxxx',
            storeURL: 'https://the_store_url_where_you_recorded_har',
        });

        // 2. Serve additional static files with Playwright
        // await page.route('**/checkout/payment/hosted-field?**', route => route.fulfill( {status: 200, path: './tests/_support/hostedField.html' } ));

        // 3. Mock API endpoints via Playwright
        // await page.route('**/api/public/v1/orders/payments', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify({})} ));

        // 4. Playwright scripts
        await page.goto('http://localhost:8080/');
        await page.pause();

        // 5. Assertions
        // await expect(page.locator('data-test=order-confirmation-heading')).toContainText('Thank you');

        // 6. Close PollyJS and Playwright
        await polly.stop();
        await page.close();
    });
});
