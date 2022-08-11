import { test, CustomerStepPreset, PaymentStepAsGuestPreset } from '../';
import { internalOrder, order, orderPayment, validateMerchantResponse, consignments } from './ApplePayTestMockResponse';

test.describe('ApplePay', () => {
    test.skip('ApplePay in payment step', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await page.addInitScript({ path: './tests/apple-pay/ApplePaySessionMockObject.js' });

        const storeUrl = 'https://my-dev-store-759854325.store.bcdev';
        const responseProps = { status: 200, contentType: 'application/json' };
        await checkout.use(new PaymentStepAsGuestPreset(storeUrl));
        await checkout.create('ApplePay in Payment Step', storeUrl);
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

    test('ApplePay in customer step', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await page.addInitScript({ path: './tests/apple-pay/ApplePaySessionMockObject.js' });

        const storeUrl = 'https://my-dev-store-759854325.store.bcdev';
        const responseProps = { status: 200, contentType: 'application/json' };
        await checkout.use(new CustomerStepPreset(storeUrl));
        await checkout.create('ApplePay in Customer Step', storeUrl);        

        await checkout.route(/order-confirmation.*/, './tests/support/orderConfirmation.ejs', { orderId: '124' });
        await page.route('**/api/public/v1/payments/applepay/validate_merchant', route => route.fulfill({ ...responseProps, body: validateMerchantResponse }));        
        await page.route(/.*\/api\/storefront\/orders\/124.*/, route => route.fulfill({...responseProps, body: order }));
        await page.route('**/api/public/v1/orders/payments', route => route.fulfill({ ...responseProps, body: orderPayment }));
        await page.route(/.*\/api\/storefront\/checkouts\/124.*\/consignments/, route => route.fulfill({...responseProps, body: consignments }));
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
