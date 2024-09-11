import { expect } from '@playwright/test';

import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Klarna', () => {
    test('Customer should be able to pay using KlarnaV2 through the payment step in checkout', async ({
        assertions,
        checkout,
        page,
    }) => {
        // 1. Testing environment setup
        const klarnaWidgetSelector = 'id=klarnaWidget';
        let klarnaRequestMade = false;

        await checkout.use(new PaymentStepAsGuestPreset());
        await checkout.start('Klarna in Payment Step');

        await checkout.route(
            '**/credit.klarnacdn.net/lib/v1/api.js',
            `${__dirname}/support/klarnaMock.js`,
        );

        page.on('request', (request) => {
            if (request.url().includes('authorize_called')) {
                klarnaRequestMade = true;
            }
        });

        // 2. Playwright actions
        await page.pause();
        await checkout.goto();
        await checkout.placeOrder();

        // 3. Assertions
        await assertions.shouldSeePaymentStep();
        await assertions.shouldSeeElement(klarnaWidgetSelector);

        expect(klarnaRequestMade).toBe(true);
    });
});
