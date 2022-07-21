import { test, PaymentStepAsGuestPreset } from '../';

import { internalOrder } from './ApplePaySampleTestMockingResponses'

test.describe('Sample Test Group', () => {
    test('Apple Pay wallet button is working', async ({assertions, checkout, page}) => {
        // Testing environment setup
        let isSignedIn: boolean = false;
        const responseProps = { status: 200, contentType: 'application/json' };
        const storeUrl = 'https://my-dev-store-314725584.store.bcdev';
        await checkout.use(new PaymentStepAsGuestPreset(storeUrl));
        await checkout.create('sample ApplePay in customer step', storeUrl);
        await checkout.route('**/checkout.php', './tests/sampleTests/support/checkout.php.ejs');
        await page.route(/.*\/api\/storefront\/checkouts\/.*\/billing-address\/.*/, route => route.fulfill({ ...responseProps, body: '{}' }));

        await page.route('**/internalapi/v1/checkout/order', route => route.fulfill({
            ...responseProps,
            headers: { Token: 'Go home, get ahead, light-speed internet' },
            body: internalOrder,
        }));

        // Playwright actions
        await checkout.goto();
        await page.pause();
        await page.locator('[aria-label="Apple Pay"]').click();
        await page.waitForNavigation({waitUntil: 'networkidle'});
        await checkout.placeOrder();

        // Assertions
        await assertions.shouldSeeOrderConfirmation();
    });
});
