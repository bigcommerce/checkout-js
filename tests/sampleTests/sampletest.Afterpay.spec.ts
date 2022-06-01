import { test, PaymentStepAsGuestPreset, UseAUDPreset } from '../';

test.describe('Sample Test Group', () => {
    test('Can see Afterpay AU on the payment step', async ({assertions, checkout, page}) => {
        // Testing environment setup
        const storeURL = 'https://my-dev-store-745516528.store.bcdev';
        await checkout.apply(new UseAUDPreset(page, storeURL));
        await checkout.apply(new PaymentStepAsGuestPreset(page, storeURL));
        await checkout.record(storeURL, 'sample Afterpay AUD');

        // Playwright actions
        await checkout.goto();

        // Assertions
        await assertions.shouldSeePaymentStep();
    });
});
