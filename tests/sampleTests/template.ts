import { test } from '../';

test.describe('xxxxxxxxxxxxxxxxxxxxxxx', () => {

    test.beforeEach(async ({ paymentStep }) => {
        // Setup HAR and checkout environment.
        await paymentStep.goto({ storeURL: 'https://my-dev-store-745516528.store.bcdev', harName: 'sampleName' });
    });

    test('xxxxxxxxxxxxxxxxxxxxxxx I', async ({assertions, page}) => {
        // Playwright action scripts
        await page.pause();
        // Click text=Test Payment ProviderVisaAmexMaster
        // await page.locator('text=Test Payment ProviderVisaAmexMaster').click();
        // Click [aria-label="Credit Card Number"]
        // await page.frameLocator('#bigpaypay-ccNumber iframe').locator('[aria-label="Credit Card Number"]').click();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('xxxxxxxxxxxxxxxxxxxxxxx II', async ({assertions, page}) => {
        // Playwright action scripts
        await page.pause();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('xxxxxxxxxxxxxxxxxxxxxxx III', async ({assertions, page}) => {
        // Playwright action scripts
        await page.pause();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
