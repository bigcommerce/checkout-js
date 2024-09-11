import { expect } from '@playwright/test';

import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('KlarnaV2', () => {
    test('Customer should be able to pay using KlarnaV2 through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        const klarnaV2WidgetSelector = 'id=pay_over_timeWidget';
        let klarnaRequestMade = false;

        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('KlarnaV2 in Payment Step');

        page.on('request', (request) => {
            if (request.url().endsWith('/api/storefront/initialization/klarna')) {
                klarnaRequestMade = true;
            }
        });

        // 2. Playwright actions
        await checkout.goto();
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeePaymentStep();
        await assertions.shouldSeeElement(klarnaV2WidgetSelector);

        expect(klarnaRequestMade).toBe(true);
    });
});
