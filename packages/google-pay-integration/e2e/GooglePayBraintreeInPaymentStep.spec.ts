import { CustomerStepPreset, test } from '@bigcommerce/checkout/test-framework';

import {
    afterSignIn,
    authResponse,
    beforeSignIn,
    braintreePayPalCredit,
    googlePay,
    internalOrder,
    order222,
    orderPayment,
    payment,
} from './GooglePayBraintreeMockingResponses';

test.describe('Google Pay Braintree', () => {
    test.skip('Google Pay Braintree wallet button is working', async ({
        assertions,
        checkout,
        page,
    }) => {
        // Testing environment setup
        let isSignedIn = false;

        const responseProps = { status: 200, contentType: 'application/json' };

        await checkout.use(new CustomerStepPreset());

        await checkout.start('Google Pay Braintree in Customer Step');

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
            /.*\/api\/storefront\/payments\/googlepaybraintree\?cartId=.*/,
            (route) => {
                void route.fulfill({ ...responseProps, body: googlePay });
            },
        );

        await page.route('https://payments.sandbox.braintree-api.com/graphql', (route) => {
            void route.fulfill({ ...responseProps, body: authResponse });
        });

        await page.route(/.*\/api\/storefront\/payments\/braintreepaypal\?cartId=.*/, (route) => {
            void route.abort();
        });

        await page.route(
            /.*\/api\/storefront\/payments\/braintreepaypalcredit\?cartId=.*/,
            (route) => {
                void route.fulfill({ ...responseProps, body: braintreePayPalCredit });
            },
        );

        await page.route(/.*\/api\/storefront\/orders\/222.*/, (route) => {
            void route.fulfill({ ...responseProps, body: order222 });
        });
        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({ ...responseProps, body: orderPayment });
        });
        await page.route(/.*\/api\/storefront\/checkout\/.+\?.*/, (route) => {
            if (isSignedIn) {
                void route.fulfill({ ...responseProps, body: afterSignIn });
            } else {
                isSignedIn = true;
                void route.fulfill({ ...responseProps, body: beforeSignIn });
            }
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
        await page.locator('[aria-label="Google Pay"]').click();
        await page.waitForNavigation({ waitUntil: 'networkidle' });
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
