import { Locales, PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

import { orderPayment } from './HummResponsesMock';

test.describe('Humm', () => {
    test('Customer should be able to pay using Humm through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset('AUD', 'AU', Locales.AU));
        await checkout.start('Humm in Payment Step');

        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: orderPayment,
            });
        });

        // 2. Playwright actions
        await checkout.goto();
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
