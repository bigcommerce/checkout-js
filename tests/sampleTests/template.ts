import { test, PaymentStepAsGuestPreset } from '../';

test.describe('xxxxxxxxxxxxxxxxxxxxxxx', () => {
    test('xxxxxxxxxxxxxxxxxxxxxxx', async ({assertions, checkout, page}) => {
        // Testing environment setup
        const storeURL = 'https://my-dev-store-xxxxxxxxx.store.bcdev';
        await checkout.use(new PaymentStepAsGuestPreset(storeURL));
        await checkout.create('name of the har for this test', storeURL);
        await page.route(/https:\/\/play.google.com\/log.*|https:\/\/pay.google.com\/gp\/p\/ui\/pay/, route => {
            route.abort();
        });

        // Playwright actions
        // await page.locator('text=Test Payment ProviderVisaAmexMaster').click();
        // await page.frameLocator('#bigpaypay-ccNumber iframe').locator('[aria-label="Credit Card Number"]').click();
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
