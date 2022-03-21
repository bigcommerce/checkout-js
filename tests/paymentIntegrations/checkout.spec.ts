import { test, expect, Page } from '@playwright/test';

import { checkoutConfig, formFields, checkout, payments, braintree, order } from './api.mock';

// test.use({ headless: false } );

test.beforeEach(async ({ page }) => {
  // page.on('request', request => { console.log('>>', request.method(), request.url()) });
  // page.on('response', response => console.log('<<', response.status(), response.url() ));

  // @ts-ignore
  await page.route('**/api/storefront/checkout/**', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(checkout) } ));
  // @ts-ignore
  await page.route('**/api/storefront/form-fields', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(formFields) } ));
  // @ts-ignore
  await page.route('**/api/storefront/checkout-settings', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(checkoutConfig) } ));
  // @ts-ignore
  await page.route('**/api/storefront/payments', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(payments) } ));
  // @ts-ignore
  await page.route('**/api/storefront/payments/braintree', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(braintree) } ));
  // @ts-ignore
  await page.route('**/api/storefront/payments/braintree', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(braintree) } ));
  // @ts-ignore
  await page.route('**/api/storefront/orders/**', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(order) } ));

  await page.goto('http://localhost:8080/');
});

test.describe('Checkout', () => {
  test('Should be loaded', async ({ page }) => {
    await expect(page).toHaveTitle(/.*Test Store*/i);
  });

  test('Should be at payment step', async ({ page }) => {

    await page.waitForLoadState('networkidle');

    // await page.screenshot({ path: 'test_current_page.png' });
    // await page.screenshot({ path: 'test_fullpage.png', fullPage: true });
    // await page.locator('#checkout-payment-continue').screenshot({ path: 'test_button.png' });

    const buttonText = await page.textContent('#checkout-payment-continue');
    expect(buttonText).toBe('Place Order');

  });
});
