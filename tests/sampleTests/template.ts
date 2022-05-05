import { test } from '../';

test.describe('xxxxxxxxxxxxxxxxxxxxxxx', () => {

    test.beforeEach(async ({ paymentStep }) => {
        // Setup HAR and checkout environment.
        await paymentStep.goto({ storeURL: 'https://my-dev-store-745516528.store.bcdev', harName: 'sampleName' });
    });

    test('xxxxxxxxxxxxxxxxxxxxxxx I', async ({paymentStep, page}) => {
        // Optional: Serve additional static files with Playwright. Mock API endpoints via Playwright.
        // Only execute in the replay mode
        if (paymentStep.isReplay) {
            // await page.route('**/checkout/payment/hosted-field?**', route => route.fulfill( {status: 200, path: './tests/sampleTests/_support/hostedField.html' } ));
            // await page.route('**/api/public/v1/orders/payments', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(submitPaymentResult)} ));
        }

        // Playwright action scripts
        await page.pause();
        // Click text=Test Payment ProviderVisaAmexMaster
        // await page.locator('text=Test Payment ProviderVisaAmexMaster').click();
        // Click [aria-label="Credit Card Number"]
        // await page.frameLocator('#bigpaypay-ccNumber iframe').locator('[aria-label="Credit Card Number"]').click();

        // Assertions
        await paymentStep.assertions.shouldSeeOrderConfirmation();
    });

    test('xxxxxxxxxxxxxxxxxxxxxxx II', async ({paymentStep, page}) => {
        // Playwright action scripts
        await page.pause();

        // Assertions
        await paymentStep.assertions.shouldSeeOrderConfirmation();
    });

    test('xxxxxxxxxxxxxxxxxxxxxxx III', async ({paymentStep, page}) => {
        // Playwright action scripts
        await page.pause();

        // Assertions
        await paymentStep.assertions.shouldSeeOrderConfirmation();
    });
});
