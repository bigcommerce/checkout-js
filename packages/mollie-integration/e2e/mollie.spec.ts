import { PaymentStepAsGuestEUPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Mollie', () => {
    test('Customer should be able to pay using klarnapaylater with Mollie through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestEUPreset());
        await checkout.start('Klarnapaylater with Mollie in Payment Step');

        // Optional: Add mockups.
        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"status":"ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data":null,"callback_url":null},"provider_data":null,"errors":[]}',
            });
        });

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('klarnapaylater');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using klarnapaynow with Mollie through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestEUPreset());
        await checkout.start('Klarnapaynow with Mollie in Payment Step');

        // Optional: Add mockups.
        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"status":"ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data":null,"callback_url":null},"provider_data":null,"errors":[]}',
            });
        });

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('klarnapaynow');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using klarnasliceit with Mollie through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestEUPreset());
        await checkout.start('Klarnasliceit with Mollie in Payment Step');

        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"status":"ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data":null,"callback_url":null},"provider_data":null,"errors":[]}',
            });
        });

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('klarnasliceit');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using sofort with Mollie through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestEUPreset());
        await checkout.start('Sofort with Mollie in Payment Step');
        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"status":"ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data":null,"callback_url":null},"provider_data":null,"errors":[]}',
            });
        });

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('sofort');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using CC with Mollie through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestEUPreset());
        await checkout.start('CC with Mollie in Payment Step');
        // Optional: Add mockups.
        await checkout.route(
            /https:\/\/bigpay.service.bcdev\/pay\/hosted_forms\/.+\/field?.+|http:\/\/localhost:.+\/checkout\/payment\/hosted-field?.+/,
            `${__dirname}/support/hostedField.ejs`,
        );
        await checkout.route(
            'https://js.mollie.com/v1/mollie.js',
            `${__dirname}/support/mollie.mock.js`,
        );

        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"status":"ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data":null,"callback_url":null},"provider_data":null,"errors":[]}',
            });
        });

        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('credit_card');
        await page
            .locator('#mollie-card-number-component-field')
            .getByRole('textbox')
            .fill('4111-1111-1111-1111');
        await page
            .locator('#mollie-card-holder-component-field')
            .getByRole('textbox')
            .fill('John Doe');
        await page.locator('#mollie-card-cvc-component-field').getByRole('textbox').fill('123');
        await page
            .locator('#mollie-card-expiry-component-field')
            .getByRole('textbox')
            .fill('12/25');

        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
