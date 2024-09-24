import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

import { boltCart, merchantData, orderPayment } from './support/BoltTestMockResponse';

const responseProps = { status: 200, contentType: 'application/json' };

test.describe('Bolt Embedded', () => {
    test('Customer should be able to pay using Bolt Embedded through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // Testing environment setup
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Bolt Embedded One Click Checkout');

        await checkout.route('**/checkout.php', `${__dirname}/support/checkout.php.ejs`);
        await checkout.route(
            'https://connect-sandbox.bolt.com/embed.js',
            `${__dirname}/support/bolt.mock.js`,
        );

        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({ ...responseProps, body: orderPayment });
        });

        await page.route('**/api/storefront/payments/bolt?cartId=*', (route) => {
            void route.fulfill({ ...responseProps, body: boltCart });
        });

        // await checkout.route(
        //     /order-confirmation.*/,
        //     './packages/test-framework/src/support/orderConfirmation.ejs',
        //     { orderId: '124' },
        // );
        // await page.route(/.*\/api\/storefront\/orders\/124.*/, (route) => {
        //     void route.fulfill({ ...responseProps, body: order });
        // });

        // await page.route('**/internalapi/v1/checkout/order', (route) => {
        //     void route.fulfill({
        //         ...responseProps,
        //         // eslint-disable-next-line @typescript-eslint/naming-convention
        //         headers: { Token: 'White shirt now red, my bloody nose' },
        //         body: internalOrder,
        //     });
        // });

        await page.route('https://api-sandbox.bolt.com/v1/merchant?publishable_key=*', (route) => {
            void route.fulfill({ ...responseProps, body: merchantData });
        });

        // Playwright actions
        await checkout.goto();

        await page
            // .frameLocator('#credit-card-input')
            // .locator('#ccn')
            .getByPlaceholder('Card number')
            .fill('4111  1111  1111  1111');
        await page
            // .frameLocator('#credit-card-input')
            // .locator('#exp')
            .getByPlaceholder('Expiration (MM/YY)')
            .fill('08 / 29');
        await page
            // .frameLocator('#credit-card-input').
            // .locator('#cvv')
            .getByPlaceholder('CVV')
            .fill('111');

        await checkout.placeOrder();
        await page.waitForLoadState('networkidle');

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
