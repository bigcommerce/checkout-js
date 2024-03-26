import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('BlueSnapv2', () => {
    test('Customer should be able to pay using Credit Card with BlueSnapv2 through the payment step in checkout', async ({
        assertions,
        checkout,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Credit Card with BlueSnapv2 in Payment Step');
        await checkout.route(
            'https://sandbox.bluesnap.com/buynow/checkout?*',
            `${__dirname}/support/bluesnapv2.ejs`,
        );
        await checkout.route('**/pay/initialize', `${__dirname}/support/bluesnapv2.ejs`);

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('cc');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using Bank Transfer with BlueSnapv2 through the payment step in checkout', async ({
        assertions,
        checkout,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Bank Transfer with BlueSnapv2 in Payment Step');
        await checkout.route(
            'https://sandbox.bluesnap.com/buynow/checkout?*',
            `${__dirname}/support/bluesnapv2.ejs`,
        );
        await checkout.route('**/pay/initialize', `${__dirname}/support/bluesnapv2.ejs`);

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('banktransfer');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using wire with BlueSnapv2 through the payment step in checkout', async ({
        assertions,
        checkout,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Wire with BlueSnapv2 in Payment Step');
        await checkout.route(
            'https://sandbox.bluesnap.com/buynow/checkout?*',
            `${__dirname}/support/bluesnapv2.ejs`,
        );
        await checkout.route('**/pay/initialize', `${__dirname}/support/bluesnapv2.ejs`);

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('wire');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using Paysafecard with BlueSnapv2 through the payment step in checkout', async ({
        assertions,
        checkout,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Paysafecard with BlueSnapv2 in Payment Step');
        await checkout.route(
            'https://sandbox.bluesnap.com/buynow/checkout?*',
            `${__dirname}/support/bluesnapv2.ejs`,
        );
        await checkout.route('**/pay/initialize', `${__dirname}/support/bluesnapv2.ejs`);

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('paysafecard');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using Moneybookers with BlueSnapv2 through the payment step in checkout', async ({
        assertions,
        checkout,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Moneybookers with BlueSnapv2 in Payment Step');
        await checkout.route(
            'https://sandbox.bluesnap.com/buynow/checkout?*',
            `${__dirname}/support/bluesnapv2.ejs`,
        );
        await checkout.route('**/pay/initialize', `${__dirname}/support/bluesnapv2.ejs`);

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('moneybookers');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using ACH with BlueSnapv2 through the payment step in checkout', async ({
        assertions,
        checkout,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('ACH with BlueSnapv2 in Payment Step');
        await checkout.route(
            'https://sandbox.bluesnap.com/buynow/checkout?*',
            `${__dirname}/support/bluesnapv2.ejs`,
        );
        await checkout.route('**/pay/initialize', `${__dirname}/support/bluesnapv2.ejs`);

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('ecp');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
