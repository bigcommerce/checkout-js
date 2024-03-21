import {
    PaymentStepAsGuestPreset,
    test,
} from '@bigcommerce/checkout/test-framework';

test.describe('BlueSnapv2', () => {

    test('Customer should be able to pay using BlueSnapv2 external APM through the payment step in checkout', async ({
        assertions,
        checkout,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('External APM with BlueSnapv2 in Payment Step');
        await checkout.route('**/checkout.php', `${__dirname}/support/checkout.php.ejs`);

        await checkout.route(
            'https://sandbox.bluesnap.com/buynow/checkout?*',
            `${__dirname}/support/bluesnap.ejs`,
        );

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('banktransfer');

        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
