import { Locales, PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('StripeUPE', () => {
    test('Customer should be able to pay using Stripe UPE US Bank Account through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        await checkout.use(new PaymentStepAsGuestPreset('USD', 'US', Locales.US));
        await checkout.start('Stripe UPE US Bank Account in Payment Step');
        await checkout.route('**/checkout.php', `${__dirname}/support/checkout.php.ejs`);
        await checkout.route('https://js.stripe.com/v3/', `${__dirname}/support/stripeUPE.mock.js`);
        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"status": "ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data": null,"callback_url": null},"provider_data": null,"errors": []}',
            });
        });
        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('us_bank_account');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using Stripe UPE Credit Cards through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        await checkout.use(new PaymentStepAsGuestPreset('USD', 'US', Locales.US));
        await checkout.start('Stripe UPE Credit Cards in Payment Step');
        await checkout.route('**/checkout.php', `${__dirname}/support/checkout.php.ejs`);
        await checkout.route('https://js.stripe.com/v3/', `${__dirname}/support/stripeUPE.mock.js`);

        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"status": "ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data": null,"callback_url": null},"provider_data": null,"errors": []}',
            });
        });
        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('card');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using Stripe UPE Wechat through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        await checkout.use(new PaymentStepAsGuestPreset('USD', 'US', Locales.US));
        await checkout.start('Stripe UPE Wechat in Payment Step');
        await checkout.route('**/checkout.php', `${__dirname}/support/checkout.php.ejs`);
        await checkout.route('https://js.stripe.com/v3/', `${__dirname}/support/stripeUPE.mock.js`);

        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"status": "ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data": null,"callback_url": null},"provider_data": null,"errors": []}',
            });
        });
        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('wechat_pay');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using Stripe UPE Alipay through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        await checkout.use(new PaymentStepAsGuestPreset('USD', 'US', Locales.US));
        await checkout.start('Stripe UPE Alipay in Payment Step');
        await checkout.route('**/checkout.php', `${__dirname}/support/checkout.php.ejs`);
        await checkout.route('https://js.stripe.com/v3/', `${__dirname}/support/stripeUPE.mock.js`);
        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: '{"status": "ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data": null,"callback_url": null},"provider_data": null,"errors": []}',
            });
        });
        // 2. Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('alipay');
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
