import { test, PaymentStepAsGuestPreset } from '../';
import { ApplePaySession } from './ApplePaySessionMock';
import { applepay, internalOrder, order, orderPayment, payments, validateMerchantResponse } from './ApplePayTestMockResponse';

interface ApplePayWindow extends Window {
    ApplePaySession: ApplePaySession;
}

// Record command
// PORT=3001 MODE=RECORD npx playwright test applepay --headed

test.describe('Apple Pay', () => {
    test('Apple Pay', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        const storeUrl = 'https://store-4j2kt0jl0q.store.bcdev/';
        await checkout.use(new PaymentStepAsGuestPreset(storeUrl));
        await checkout.create('ApplePay in Payment Step', storeUrl);

        const responseProps = { status: 200, contentType: 'application/json' };
        // await page.route(/.*\/api\/storefront\/checkout\/.+\?.*/, route => route.fulfill({...responseProps, body: xxxx}));
        await checkout.route(/order-confirmation.*/, './tests/support/orderConfirmation.ejs', { orderId: '124' });
        await page.route(/.*\/api\/storefront\/payments\?cartId=.*/, route => route.fulfill({ ...responseProps, body: payments }));
        await page.route(/.*\/api\/storefront\/payments\/applepay\?cartId=.*/, route => route.fulfill({ ...responseProps, body: applepay }));
        await page.route('**/api/public/v1/payments/applepay/validate_merchant', route => route.fulfill({ ...responseProps, body: validateMerchantResponse }));
        await page.route(/.*\/api\/storefront\/orders\/124.*/, route => route.fulfill({...responseProps, body: order }));
        await page.route('**/api/public/v1/orders/payments', route => route.fulfill({ ...responseProps, body: orderPayment }));
        await page.route('**/internalapi/v1/checkout/order', route => route.fulfill({
            ...responseProps,
            headers: { Token: 'Go home, get ahead, light-speed internet' },
            body: internalOrder,
        }));

        // Playwright actions
        await checkout.goto();
        await page.evaluate(()=>{
            const main = () => {
                (window as unknown as ApplePayWindow).ApplePaySession = new ApplePaySession(1, {});
            }

            const wrapFunction = (injectedFunction) => {
                return '(' + injectedFunction + ')();';
            }

            const injectScript = () => {
                const script = document.createElement('script');
                script.textContent = wrapFunction(main);
                (document.head || document.documentElement).appendChild(script);
                script.remove();
            }

            injectScript();
        });
        
        await page.pause();

        // Figure out the locator once store is public
        await page.locator('[aria-label="Apple Pay"]').click();
        await page.waitForNavigation({waitUntil: 'networkidle'});
        await checkout.placeOrder();

        // Assertions
        await page.pause();
        await assertions.shouldSeeOrderConfirmation();
    })
});
