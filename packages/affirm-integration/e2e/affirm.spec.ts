import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

import { affirmCart, order, orderPayment } from './AffirmResponsesMock';

test.describe('Affirm', () => {
    test('Customer should be able to pay using Affirm through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // Testing environment setup
        const responseProps = { status: 200, contentType: 'application/json' };

        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Affirm in Payment Step');

        await checkout.route('**/js/v2/affirm.js', `${__dirname}/support/affirmMock.js`);

        await checkout.route(
            /order-confirmation.*/,
            './packages/test-framework/src/support/orderConfirmation.ejs',
            { orderId: '344' },
        );

        await page.route('**/api/storefront/payments/affirm?cartId=*', (route) => {
            void route.fulfill({ ...responseProps, body: affirmCart });
        });

        await page.route(/.*\/api\/storefront\/orders\/344.*/, (route) => {
            void route.fulfill({ ...responseProps, body: order });
        });

        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({ ...responseProps, body: orderPayment });
        });

        // 2. Playwright actions
        await checkout.goto();
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
