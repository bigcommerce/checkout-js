import {
    CustomerStepPreset,
    PaymentStepAsGuestPreset,
    test,
} from '@bigcommerce/checkout/test-framework';

import addApplePaySessionToChromeCustomerStep from './ApplePaySessionCustomerStepMockObject';
import addApplePaySessionToChromePaymentStep from './ApplePaySessionPaymentStepMockObject';
import {
    applePayCart,
    consignmentsAndBilling,
    internalOrder,
    order,
    orderPayment,
    validateMerchantResponse,
} from './ApplePayTestMockResponse';

test.describe('ApplePay', () => {
    test('Customer should be able to pay using ApplePay through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // Testing environment setup
        await page.addInitScript(addApplePaySessionToChromePaymentStep);

        const responseProps = { status: 200, contentType: 'application/json' };

        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('ApplePay in Payment Step');
        await checkout.route(
            /order-confirmation.*/,
            './packages/test-framework/src/support/orderConfirmation.ejs',
            { orderId: '124' },
        );
        await page.route('**/api/storefront/payments/applepay?cartId=*', (route) => {
            void route.fulfill({ ...responseProps, body: applePayCart });
        });
        await page.route('**/api/public/v1/payments/applepay/validate_merchant', (route) => {
            void route.fulfill({ ...responseProps, body: validateMerchantResponse });
        });
        await page.route(/.*\/api\/storefront\/orders\/124.*/, (route) => {
            void route.fulfill({ ...responseProps, body: order });
        });
        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({ ...responseProps, body: orderPayment });
        });
        await page.route('**/internalapi/v1/checkout/order', (route) => {
            void route.fulfill({
                ...responseProps,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { Token: 'White shirt now red, my bloody nose' },
                body: internalOrder,
            });
        });

        // Playwright actions
        await checkout.goto();
        await checkout.selectPaymentMethod('applepay');
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });

    test('Customer should be able to pay using ApplePay through the customer step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // Testing environment setup
        await page.addInitScript(addApplePaySessionToChromeCustomerStep);

        const responseProps = { status: 200, contentType: 'application/json' };

        await checkout.use(new CustomerStepPreset());
        await checkout.start('ApplePay in Customer Step');
        await checkout.route(
            /order-confirmation.*/,
            './packages/test-framework/src/support/orderConfirmation.ejs',
            { orderId: '124' },
        );
        await page.route('**/api/public/v1/payments/applepay/validate_merchant', (route) => {
            void route.fulfill({ ...responseProps, body: validateMerchantResponse });
        });
        await page.route(/.*\/api\/storefront\/orders\/124.*/, (route) => {
            void route.fulfill({ ...responseProps, body: order });
        });
        await page.route('**/api/public/v1/orders/payments', (route) => {
            void route.fulfill({ ...responseProps, body: orderPayment });
        });
        await page.route(/.*\/api\/storefront\/checkout\/124.*\//, (route) => {
            void route.fulfill({ ...responseProps, body: consignmentsAndBilling });
        });
        await page.route(/.*\/api\/storefront\/checkouts\/124.*\/consignments/, (route) => {
            void route.fulfill({ ...responseProps, body: consignmentsAndBilling });
        });
        await page.route(/.*\/api\/storefront\/checkouts\/124.*\/billing-address/, (route) => {
            void route.fulfill({ ...responseProps, body: consignmentsAndBilling });
        });
        await page.route('**/internalapi/v1/checkout/order', (route) => {
            void route.fulfill({
                ...responseProps,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { Token: 'White shirt now red, my bloody nose' },
                body: internalOrder,
            });
        });

        // Playwright actions
        await checkout.goto();
        await page.locator('[aria-label="Apple Pay"]').click();
        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
