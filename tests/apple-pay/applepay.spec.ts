import { test, CustomerStepPreset, PaymentStepAsGuestPreset } from '../';
import { internalOrder, order, orderPayment, validateMerchantResponse, consignmentsAndBilling } from './ApplePayTestMockResponse';

test.describe('ApplePay', () => {
    test('Customer should be able to pay using ApplePay through the payment step in checkout', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await page.addInitScript({ path: './tests/apple-pay/ApplePaySessionPaymentStepMockObject.js' });

        const responseProps = { status: 200, contentType: 'application/json' };
        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.route(/order-confirmation.*/, './tests/support/orderConfirmation.ejs', { orderId: '124' });
        await page.route('**/api/public/v1/payments/applepay/validate_merchant', route => route.fulfill({ ...responseProps, body: validateMerchantResponse }));
        await page.route(/.*\/api\/storefront\/orders\/124.*/, route => route.fulfill({...responseProps, body: order }));
        await page.route('**/api/public/v1/orders/payments', route => route.fulfill({ ...responseProps, body: orderPayment }));
        await page.route('**/internalapi/v1/checkout/order', route => route.fulfill({
            ...responseProps,
            headers: { Token: 'White shirt now red, my bloody nose' },
            body: internalOrder,
        }));

        // Playwright actions
        await checkout.goto();
        await page.locator('label div').first().click();
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();        
    })

    test('Customer should be able to pay using ApplePay through the customer step in checkout', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await page.addInitScript({ path: './tests/apple-pay/ApplePaySessionCustomerStepMockObject.js' });

        const responseProps = { status: 200, contentType: 'application/json' };
        await checkout.use(new CustomerStepPreset());

        await checkout.route(/order-confirmation.*/, './tests/support/orderConfirmation.ejs', { orderId: '124' });
        await page.route('**/api/public/v1/payments/applepay/validate_merchant', route => route.fulfill({ ...responseProps, body: validateMerchantResponse }));        
        await page.route(/.*\/api\/storefront\/orders\/124.*/, route => route.fulfill({...responseProps, body: order }));
        await page.route('**/api/public/v1/orders/payments', route => route.fulfill({ ...responseProps, body: orderPayment }));
        await page.route(/.*\/api\/storefront\/checkouts\/124.*\/consignments/, route => route.fulfill({...responseProps, body: consignmentsAndBilling }));
        await page.route(/.*\/api\/storefront\/checkouts\/124.*\/billing-address/, route => route.fulfill({...responseProps, body: consignmentsAndBilling }));
        await page.route('**/internalapi/v1/checkout/order', route => route.fulfill({
            ...responseProps,
            headers: { Token: 'White shirt now red, my bloody nose' },
            body: internalOrder,
        }));

        // Playwright actions
        await checkout.goto();
        await page.locator('[aria-label="Apple Pay"]').click();
        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    })
});
