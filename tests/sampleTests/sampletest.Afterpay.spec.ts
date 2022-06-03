import { test, PaymentStepAsGuestPreset, UseAUDPreset } from '../';

test.describe('Sample Test Group', () => {
    test('Can see Afterpay AU on the payment step', async ({assertions, checkout}) => {
        // Testing environment setup
        const storeURL = 'https://my-dev-store-745516528.store.bcdev';
        await checkout.use(new UseAUDPreset(storeURL));
        await checkout.use(new PaymentStepAsGuestPreset(storeURL));
        await checkout.create('sample Afterpay AUD', storeURL);

        // Playwright actions
        await checkout.goto();

        // Assertions
        await assertions.shouldSeePaymentStep();
    });
});
