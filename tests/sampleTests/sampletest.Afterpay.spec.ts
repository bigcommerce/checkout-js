import { test, PaymentStepAsGuestPreset, UseAUDPreset } from '../';

test.describe('Sample Test Group', () => {
    test('Can see Afterpay AU on the payment step', async ({assertions, checkout}) => {
        // Testing environment setup
        const storeUrl = 'https://my-dev-store-745516528.store.bcdev';
        await checkout.use(new UseAUDPreset(storeUrl));
        await checkout.use(new PaymentStepAsGuestPreset(storeUrl));
        await checkout.create('sample Afterpay AUD', storeUrl);

        // Playwright actions
        await checkout.goto();

        // Assertions
        await assertions.shouldSeePaymentStep();
    });
});
