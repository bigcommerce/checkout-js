import { CustomerStepPreset, test } from '@bigcommerce/checkout/test-framework';

import {
    checkoutOrder,
    googlePay,
    internalOrder,
    order222,
    orderPayment,
    payment,
} from './GooglePayMockingResponses';

test.describe('Google Pay CheckoutCom', () => {
    test('Google Pay CheckoutCom wallet button is working', async ({
        assertions,
        checkout,
        page,
    }) => {
        // Testing environment setup
        const responseProps = { status: 200, contentType: 'application/json' };

        await checkout.use(new CustomerStepPreset());

        await checkout.start('Google Pay CheckoutCom in Customer Step');

        await checkout.route(
            /order-confirmation.*/,
            './packages/test-framework/src/support/orderConfirmation.ejs',
            { orderId: '222' },
        );

        await checkout.route('**/checkout.php', `${__dirname}/support/checkout.php.ejs`);

        await checkout.route(
            'https://pay.google.com/gp/p/js/pay.js',
            `${__dirname}/support/googlePay.mock.js`,
        );

        await page.route(
            /https:\/\/play.google.com\/log.*|https:\/\/pay.google.com\/gp\/p\/ui\/pay/,
            (route) => {
                void route.abort();
            },
        );

        await page.route(/.*\/api\/storefront\/payments\?cartId=.*/, (route) => {
            void route.fulfill({ ...responseProps, body: payment });
        });

        await page.route(
            /.*\/api\/storefront\/payments\/googlepaycheckoutcom\?cartId=.*/,
            (route) => {
                void route.fulfill({ ...responseProps, body: googlePay });
            },
        );

        await page.route(/.*\/api\/storefront\/orders\/222.*/, (route) => {
            void route.fulfill({ ...responseProps, body: order222 });
        });
        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({ ...responseProps, body: orderPayment });
        });
        await page.route(/.*\/api\/storefront\/checkout\/.+\?.*/, (route) => {
            void route.fulfill({ ...responseProps, body: checkoutOrder });
        });
        await page.route(/.*\/api\/storefront\/checkouts\/.*\/billing-address\?/, (route) => {
            void route.fulfill({ ...responseProps, body: '{}' });
        });

        await page.route('**/internalapi/v1/checkout/order', (route) => {
            void route.fulfill({
                ...responseProps,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { Token: 'Go home, get ahead, light-speed internet' },
                body: internalOrder,
            });
        });

        // Playwright actions
        await checkout.goto();
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
