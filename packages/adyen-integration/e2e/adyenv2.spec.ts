// import { PaymentStepAsGuestPreset, test } from '@bigcommerce/checkout/test-framework';

// test.describe('Adyenv2', () => {
//     test('Customer should be able to pay using ACH with Adyenv2 through the payment step in checkout', async ({
//         assertions,
//         checkout,
//         page,
//     }) => {
//         await checkout.use(new PaymentStepAsGuestPreset());
//         await checkout.start('Adyenv2 ACH in Payment Step');
//         await checkout.route(
//             'https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/3.10.1/adyen.js',
//             `${__dirname}/adyenv2.mock.js`,
//         );
//         await checkout.route('**/checkout.php', `${__dirname}/support/checkout.php.ejs`);

//         await page.route('**/api/public/v1/orders/payments', (route) => {
//             void route.fulfill({
//                 status: 200,
//                 contentType: 'application/json',
//                 body: '{"status": "ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data": null,"callback_url": null},"provider_data": null,"errors": []}',
//             });
//         });
//         // 2. Playwright actions
//         await checkout.goto();
//         await checkout.selectPaymentMethod('ach');
//         await page.getByLabel('Account number').fill('123450000');
//         await page.getByLabel('ABA routing number').fill('011000015');
//         await checkout.placeOrder();
//         await page.waitForLoadState('networkidle');

//         // 3. Assertions
//         await assertions.shouldSeeOrderConfirmation();
//     });

//     test('Customer should be able to pay using Credit Card with Adyenv2 in payment step in checkout', async ({
//         assertions,
//         checkout,
//         page,
//     }) => {
//         await checkout.use(new PaymentStepAsGuestPreset());
//         await checkout.start('Adyenv2 Credit Card in Payment Step');
//         await checkout.route(
//             'https://checkoutshopper-test.adyen.com/checkoutshopper/sdk/3.10.1/adyen.js',
//             `${__dirname}/adyenv2.mock.js`,
//         );
//         await checkout.route('**/checkout.php', `${__dirname}/support/checkout.php.ejs`);
//         await page.route('**/api/public/v1/orders/payments', (route) => {
//             void route.fulfill({
//                 status: 200,
//                 contentType: 'application/json',
//                 body: '{"status": "ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data": null,"callback_url": null},"provider_data": null,"errors": []}',
//             });
//         });

//         // 2. Playwright actions
//         await checkout.goto();
//         await checkout.selectPaymentMethod('scheme');
//         await page.getByPlaceholder('1234 5678 9012 3456').fill('4111 1111 4555 1142');
//         await page.getByPlaceholder('MM/YY').fill('03/30');
//         await page.getByPlaceholder('123', { exact: true }).fill('123');

//         await checkout.placeOrder();
//         await page.waitForLoadState('networkidle');

//         // 3. Assertions
//         await assertions.shouldSeeOrderConfirmation();
//     });
// });
