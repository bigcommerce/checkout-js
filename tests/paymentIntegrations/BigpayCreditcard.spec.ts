import { chromium, expect, Page, test } from '@playwright/test';
import { Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';
import { PlaywrightAdapter } from 'polly-adapter-playwright';

// dirty but sweet hack
// from https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const path = require('path');

test.use({
    headless: false,
    viewport: { width: 1000, height: 1000 },
});

test.describe('Checkout', () => {

    test('Credit card payment is working', async () => {
        test.setTimeout(0);

        const browser = await chromium.launch();
        const page = await browser.newPage();

// register the playwright adapter so it's accessible by all future polly instances
        Polly.register(PlaywrightAdapter);
        Polly.register(FSPersister);

        const polly = new Polly('checkout', {
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
                headers: {
                    exclude: ['user-agent'],
                },
            },
        });

        await page.goto('https://my-dev-store-745516528.store.bcdev/');

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

        await page.pause();

// cleanup
        await polly.stop();
        await page.close();
    });
});
