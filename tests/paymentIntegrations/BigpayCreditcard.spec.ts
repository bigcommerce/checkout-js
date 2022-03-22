import { expect, test , Page } from '@playwright/test';

import { checkout, checkoutConfig, formFields, order, payments, submitOrder, submitPayment } from './api.mock';

test.use({ headless: false } );

const checkoutReady = async (page: Page): Promise<void> => {
  await page.route('**/checkout/payment/hosted-field?**', route => route.fulfill( {status: 200, path: './tests/_support/hostedField.html' } ));
  await page.route('/', route => route.fulfill( {status: 200, path: './tests/_support/index.html' } ));

  // loading
  await page.route('**/api/storefront/checkout/**', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(checkout) } ));
  await page.route('**/api/storefront/form-fields', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(formFields) } ));
  await page.route('**/api/storefront/checkout-settings', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(checkoutConfig) } ));
  await page.route('**/api/storefront/orders/**', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(order) } ));

  // submit
  await page.route('**/internalapi/v1/checkout/order', route => route.fulfill( {status: 200, headers: {token: 'JWT eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NDc5NTM3MTcsIm5iZiI6MTY0Nzk1MDExNywiaXNzIjoicGF5bWVudHMuYmlnY29tbWVyY2UuY29tIiwic3ViIjoxMDAwMDQ1NSwianRpIjoiY2VmYjdlOTUtMGQ2MS00MWQ1LThhYzYtNGNiNmZmNzUwZTlmIiwiaWF0IjoxNjQ3OTUwMTE3LCJkYXRhIjp7InN0b3JlX2lkIjoiMTAwMDA0NTUiLCJvcmRlcl9pZCI6IjExMSIsImFtb3VudCI6MjEwMDAsImN1cnJlbmN5IjoiVVNEIiwic3RvcmVfdXJsIjoiaHR0cHM6Ly9teS1kZXYtc3RvcmUtNzQ1NTE2NTI4LnN0b3JlLmJjZGV2IiwiZm9ybV9pZCI6IjRhYTUwMTVlLWI5NDktNGNmYS1iYzQ3LTBkYzdlNzBjOTg4MyJ9fQ.t7FkZkrZq_E-6TdIInuWAtheen_S1TmgddfgHr0DFSw'}, contentType: 'application/json', body: JSON.stringify(submitOrder) } ));
  await page.route('/api/public/v1/orders/payments', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(submitPayment) } ));

  // order confirmation
  await page.route('**/order-confirmation', route => route.fulfill( {status: 200, path: './tests/_support/orderConfirmation.html' } ));

  await page.goto('http://localhost:8080/');
};

// test.beforeAll(async ({ page }) => {
//   // page.on('request', request => { console.log('>>', request.method(), request.url()) });
//   // page.on('response', response => console.log('<<', response.status(), response.url() ));
//
// });

test.describe('Checkout', () => {

  test('Credit card payment is working', async ({ page }) => {

    await page.route('**/api/storefront/payments', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(payments) } ));

    await checkoutReady(page);

    // await page.screenshot({ path: 'test_current_page.png' });
    // await page.screenshot({ path: 'test_fullpage.png', fullPage: true });
    // await page.locator('#checkout-payment-continue').screenshot({ path: 'test_button.png' });

    // await page.pause();

    const buttonText = await page.textContent('#checkout-payment-continue');
    expect(buttonText).toBe('Place Order');

    // Click [aria-label="Credit Card Number"]
    await page.frameLocator('#bigpaypay-ccNumber iframe').locator('[aria-label="Credit Card Number"]').click();
    // Fill [aria-label="Credit Card Number"]
    await page.frameLocator('#bigpaypay-ccNumber iframe').locator('[aria-label="Credit Card Number"]').fill('4111 1111 1111 1111');
    // Press Tab
    await page.frameLocator('#bigpaypay-ccNumber iframe').locator('[aria-label="Credit Card Number"]').press('Tab');
    // Fill [placeholder="MM \/ YY"]
    await page.frameLocator('#bigpaypay-ccExpiry iframe').locator('[placeholder="MM \\/ YY"]').fill('01 / 25');
    // Press Tab
    await page.frameLocator('#bigpaypay-ccExpiry iframe').locator('[placeholder="MM \\/ YY"]').press('Tab');
    // Fill [aria-label="Name on Card"]
    await page.frameLocator('#bigpaypay-ccName iframe').locator('[aria-label="Name on Card"]').fill('ROBOT');
    // Press Tab
    await page.frameLocator('#bigpaypay-ccName iframe').locator('[aria-label="Name on Card"]').press('Tab');
    // Fill [aria-label="CVV"]
    await page.frameLocator('#bigpaypay-ccCvv iframe').locator('[aria-label="CVV"]').fill('111');
    // Click text=Place Order
    await page.locator('text=Place Order').click();

    await page.pause();

  });
});
