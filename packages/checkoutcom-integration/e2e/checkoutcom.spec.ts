import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Checkoutcom', () => {
    test('Customer should be able to pay using Credit Card with Checkoutcom through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Credit Card with Checkoutcom in Payment Step');
        await checkout.route(
            /https:\/\/bigpay.service.bcdev\/pay\/hosted_forms\/.+\/field?.+|http:\/\/localhost:.+\/checkout\/payment\/hosted-field?.+/,
            `${__dirname}/support/hostedField.ejs`,
        );
        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('credit_card');
        await page
            .frameLocator('#checkoutcom-credit_card-ccNumber iframe')
            .getByRole('textbox', { name: 'Credit Card Number' })
            .fill('4242424242424242');
        await page
            .frameLocator('#checkoutcom-credit_card-ccName iframe')
            .getByRole('textbox', { name: 'Name on Card' })
            .fill('Jane');
        await page
            .frameLocator('#checkoutcom-credit_card-ccExpiry iframe')
            .getByPlaceholder('MM / YY')
            .fill('3/30');
        await page
            .frameLocator('#checkoutcom-credit_card-ccCvv iframe')
            .getByRole('textbox', { name: 'CVV' })
            .fill('123');

        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using Fawry with Checkoutcom through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset('EGP', 'EG'));
        await checkout.start('Fawry with Checkoutcom in Payment Step');
        await checkout.route(
            /https:\/\/bigpay.service.bcdev\/pay\/hosted_forms\/.+\/field?.+|http:\/\/localhost:.+\/checkout\/payment\/hosted-field?.+/,
            `${__dirname}/support/hostedField.ejs`,
        );
        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('fawry');
        await page.getByLabel('Mobile Number').fill('01058375055');
        await page.getByLabel('Email').fill('bruce@wayne-enterprises.com');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
