import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Adyenv2', () => {
    test('Customer should be able to pay using ACH with Adyenv2 through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('ACH in Payment Step');
        await checkout.route(
            /https:\/\/bigpay.service.bcdev\/pay\/hosted_forms\/.+\/field?.+|http:\/\/localhost:.+\/checkout\/payment\/hosted-field?.+/,
            `${__dirname}/support/hostedField.ejs`,
        );

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('ach');

        await page
            .frameLocator(
                'label >> internal:has-text="Account number"i >> iframe[title="Iframe for secured card data input field"]',
            )
            .getByPlaceholder('1234 5678 9012 3456 7')
            .fill('123450000');
        await page
            .frameLocator(
                'label >> internal:has-text="ABA routing number"i >> iframe[title="Iframe for secured card data input field"]',
            )
            .getByPlaceholder('123456789')
            .fill('011000015');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using 3d secure Credit Card with Adyenv2 in payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('3d secure Credit Card in Payment Step');

        // 2. Playwright actions
        await checkout.goto();
        await checkout.route(
            /https:\/\/bigpay.service.bcdev\/pay\/hosted_forms\/.+\/field?.+|http:\/\/localhost:.+\/checkout\/payment\/hosted-field?.+/,
            `${__dirname}/support/hostedField.ejs`,
        );
        await checkout.selectPaymentMethod('scheme');
        await page
            .frameLocator(
                'label >> internal:has-text="Card number"i >> iframe[title="Iframe for secured card data input field"]',
            )
            .getByPlaceholder('1234 5678 9012 3456')
            .fill('4871 0499 9999 9910');
        await page
            .frameLocator(
                'label >> internal:has-text="Expiry date"i >> iframe[title="Iframe for secured card data input field"]',
            )
            .getByPlaceholder('MM/YY')
            .fill('03/30');
        await page
            .frameLocator(
                'label >> internal:has-text="CVC / CVV"i >> iframe[title="Iframe for secured card data input field"]',
            )
            .getByPlaceholder('123')
            .fill('737');
        await checkout.placeOrder();
        await page
            .frameLocator('iframe[name="threeDSIframe"]')
            .getByPlaceholder("enter the word 'password'")
            .click();
        await page
            .frameLocator('iframe[name="threeDSIframe"]')
            .getByPlaceholder("enter the word 'password'")
            .fill('password');
        await page
            .frameLocator('iframe[name="threeDSIframe"]')
            .getByRole('button', { name: 'Continue' })
            .click();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using Credit Card with Adyenv2 in payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Credit Card in Payment Step');

        // Optional: Add mockups.
        await checkout.route(
            /https:\/\/bigpay.service.bcdev\/pay\/hosted_forms\/.+\/field?.+|http:\/\/localhost:.+\/checkout\/payment\/hosted-field?.+/,
            `${__dirname}/support/hostedField.ejs`,
        );

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('scheme');
        checkout.log();
        await page
            .frameLocator(
                'label >> internal:has-text="Card number"i >> iframe[title="Iframe for secured card data input field"]',
            )
            .getByPlaceholder('1234 5678 9012 3456')
            .fill('4111 1111 4555 1142');
        await page
            .frameLocator(
                'label >> internal:has-text="Expiry date"i >> iframe[title="Iframe for secured card data input field"]',
            )
            .getByPlaceholder('MM/YY')
            .fill('03/30');
        await page
            .frameLocator(
                'label >> internal:has-text="CVC / CVV"i >> iframe[title="Iframe for secured card data input field"]',
            )
            .getByPlaceholder('123')
            .fill('123');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
