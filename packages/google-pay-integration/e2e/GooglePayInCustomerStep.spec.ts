import { test, CustomerStepPreset } from '@bigcommerce/checkout/payment-integration-test-framework';

import { checkoutAfterSignedIn, checkoutBeforeSignedIn, googlePay, internalOrder, order390, orderPayment, payment } from './GooglePaySampleTestMockingResponses';

test.describe('Sample Test Group', () => {
    test('Google Pay wallet button is working', async ({assertions, checkout, page}) => {
        // Testing environment setup
        let isSignedIn = false;
        await checkout.use(new CustomerStepPreset());
        await checkout.start('sample GooglePay in customer step');

        const responseProps = { status: 200, contentType: 'application/json' };
        await checkout.route('https://pay.google.com/gp/p/js/pay.js', __dirname + '/support/googlePay.mock.js');
        await checkout.route('**/checkout.php', __dirname + '/support/checkout.php.ejs');
        await checkout.route(/order-confirmation.*/, './packages/payment-integration-test-framework/src/support/orderConfirmation.ejs', { orderId: '390' });
        await page.route(/.*\/api\/storefront\/payments\?cartId=.*/, route => route.fulfill({ ...responseProps, body: payment }));
        await page.route(/.*\/api\/storefront\/payments\/googlepayauthorizenet\?cartId=.*/, route => route.fulfill({ ...responseProps, body: googlePay }));
        await page.route(/.*\/api\/storefront\/checkouts\/.*\/billing-address\/.*/, route => route.fulfill({ ...responseProps, body: '{}' }));
        await page.route(/.*\/api\/storefront\/orders\/390.*/, route => route.fulfill({...responseProps, body: order390 }));
        await page.route('**/api/public/v1/orders/payments', route => route.fulfill({ ...responseProps, body: orderPayment }));
        await page.route(/https:\/\/play.google.com\/log.*|https:\/\/pay.google.com\/gp\/p\/ui\/pay/, route => {
            route.abort();
        });
        await page.route(/.*\/api\/storefront\/checkout\/.+\?.*/, route => {
            if (isSignedIn) {
                route.fulfill({...responseProps, body: checkoutAfterSignedIn});
            } else {
                isSignedIn = true;
                route.fulfill({...responseProps, body: checkoutBeforeSignedIn});
            }
        });
        await page.route('**/internalapi/v1/checkout/order', route => route.fulfill({
            ...responseProps,
            headers: { Token: 'Go home, get ahead, light-speed internet' },
            body: internalOrder,
        }));

        // Playwright actions
        await checkout.goto();
        await page.locator('[aria-label="Google Pay"]').click();
        await page.waitForNavigation({waitUntil: 'networkidle'});
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
