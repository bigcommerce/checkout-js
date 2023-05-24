import { PaymentStepAsGuestPreset, test, UseAUDPreset } from '@bigcommerce/checkout/test-framework';

test.describe('Sample Test Group', () => {
    test('Can see Afterpay AU on the payment step', async ({ assertions, checkout }) => {
        // Testing environment setup
        await checkout.use(new UseAUDPreset('AUD'));
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('sample Afterpay AUD');

        // Playwright actions
        await checkout.goto();

        // Assertions
        await assertions.shouldSeePaymentStep();
    });
});
