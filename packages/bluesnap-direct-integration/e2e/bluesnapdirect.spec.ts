import {
    PaymentStepAsGuestEUPreset,
    PaymentStepAsGuestPreset,
    test,
} from '@bigcommerce/checkout/test-framework';

test.describe('BlueSnap Direct', () => {
    test('Customer should be able to pay using Credit card with BlueSnap through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestEUPreset());
        await checkout.start('Credit Card with BlueSnap in Payment Step');
        // Optional: Add mockups.
        await checkout.route(
            /https:\/\/bigpay.service.bcdev\/pay\/hosted_forms\/.+\/field?.+|http:\/\/localhost:.+\/checkout\/payment\/hosted-field?.+/,
            `${__dirname}/support/hostedField.ejs`,
        );

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('credit_card');
        await page
            .frameLocator('#bluesnap-hosted-iframe-ccn')
            .getByRole('textbox', { name: 'Card number input' })
            .fill('4111 1111 1111 1111');
        await page
            .frameLocator('#bluesnap-hosted-iframe-cvv')
            .getByRole('textbox', { name: 'Card CVC/CVV input' })
            .fill('737');
        await page
            .frameLocator('#bluesnap-hosted-iframe-exp')
            .getByPlaceholder('MM / YY')
            .fill('03 / 30');
        await page.getByRole('textbox', { name: 'Name on Card' }).fill('John Smith');

        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using ECP/ACH with BlueSnap through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('ECP with BlueSnap in Payment Step');
        // Optional: Add mockups.
        await checkout.route(
            /https:\/\/bigpay.service.bcdev\/pay\/hosted_forms\/.+\/field?.+|http:\/\/localhost:.+\/checkout\/payment\/hosted-field?.+/,
            `${__dirname}/support/hostedField.ejs`,
        );

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('ecp');
        await page.locator('[data-test="accountNumber-text"]').fill('223344556');
        await page.locator('[data-test="routingNumber-text"]').fill('998877665');
        await page.locator('[data-test="accountType-select"]').selectOption('CONSUMER_CHECKING');
        await page.locator('[for="shopperPermission"]').click();
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using SEPA with BlueSnap through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestEUPreset());
        await checkout.start('SEPA with BlueSnap in Payment Step');

        // 2. Playwright actions
        await checkout.goto();

        await checkout.selectPaymentMethod('sepa_direct_debit');
        await page.locator('[data-test="iban-text"]').fill('DE09100100101234567893');
        await page.locator('[data-test="firstName-text"]').fill('John');
        await page.locator('[data-test="lastName-text"]').fill('Smith');
        await page.locator('[for="shopperPermission"]').click();
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using BlueSnap external APM through the payment step in checkout', async ({
        assertions,
        checkout,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestEUPreset());
        await checkout.start('External APM with BlueSnap in Payment Step');
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
