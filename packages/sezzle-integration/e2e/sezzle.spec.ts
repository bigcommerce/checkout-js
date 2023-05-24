import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

import { internalOrder, order, orderPayment } from './MockResponse';

test.describe('External payment method', () => {
    test('Sezzle is working', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        const responseProps = { status: 200, contentType: 'application/json' };

        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Sezzle');
        await checkout.route(
            'https://sandbox.checkout.sezzle.com?id=**',
            `${__dirname}/support/sezzle.com.ejs`,
        );
        await checkout.route(
            /order-confirmation.*/,
            './packages/test-framework/src/support/orderConfirmation.ejs',
            { orderId: '100' },
        );
        await page.route(/.*\/api\/storefront\/orders.*/, (route) => {
            void route.fulfill({ ...responseProps, body: order });
        });
        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({ ...responseProps, status: 400, body: orderPayment });
        });
        await page.route('**/internalapi/v1/checkout/order', (route) => {
            void route.fulfill({
                ...responseProps,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { Token: 'Beyond the yellow brick road' },
                body: internalOrder,
            });
        });

        // Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('sezzle');
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
