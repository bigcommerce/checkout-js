import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

import {
    afterSignIn,
    braintreePayPal,
    braintreePayPalCredit,
    googlePay,
    internalOrder,
    order222,
    orderPayment,
    payment,
} from './GooglePayBraintreeMockingResponses';

test.describe('Google Pay Braintree', () => {
    test('Google Pay Braintree in Payment Step', async ({ assertions, checkout, page }) => {
        const responseProps = { status: 200, contentType: 'application/json' };

        await checkout.use(new PaymentStepAsGuestPreset());

        await checkout.start('Google Pay in Payment Step');

        await checkout.route(
            /order-confirmation.*/,
            './packages/test-framework/src/support/orderConfirmation.ejs',
            { orderId: '222' },
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

        await page.route(/.*\/api\/storefront\/checkouts\/.*\/billing-address\/.*/, (route) => {
            void route.fulfill({ ...responseProps, body: '{}' });
        });

        await page.route(/.*\/api\/storefront\/payments\/braintreepaypal\?cartId=.*/, (route) => {
            void route.fulfill({ ...responseProps, body: braintreePayPal });
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
            void route.fulfill({ ...responseProps, body: afterSignIn });
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
        await checkout.selectPaymentMethod('googlepaybraintree');
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
