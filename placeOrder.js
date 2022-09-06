module.exports = { placeOrder };

async function placeOrder(page) {
    await page.goto("https://a67e6yxkbb.myprivaterelay.com/smith-journal-13/");
    await page.locator('input:has-text("Add to Cart")').click();
    await page.locator('text=Proceed to checkout').click();
    await page.waitForURL('https://a67e6yxkbb.myprivaterelay.com/checkout');
    await page.locator('input[name="email"]').click();
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('[data-test="customer-continue-as-guest-button"]').click();
    await page.locator('[data-test="customer-guest-continue"]').click();
    await page.locator('[data-test="firstNameInput-text"]').fill('BAD');
    await page.locator('[data-test="lastNameInput-text"]').fill('ROBOT');
    await page.locator('[data-test="addressLine1Input-text"]').fill('1000 5TH AVENUE');
    await page.locator('[data-test="cityInput-text"]').fill('NEW YORK');
    await page.locator('[data-test="countryCodeInput-select"]').selectOption('US');
    await page.locator('[data-test="provinceCodeInput-select"]').selectOption('NY');
    await page.locator('[data-test="postCodeInput-text"]').fill('10028');
    await page.locator('text=Continue').click();
    await page.locator('text=Test Payment Provider').click();
    await page.frameLocator('#bigpaypay-ccNumber iframe').locator('[aria-label="Credit Card Number"]').fill('4111 1111 1111 1111');
    await page.frameLocator('#bigpaypay-ccExpiry iframe').locator('[placeholder="MM \\/ YY"]').fill('11 / 23');
    await page.frameLocator('#bigpaypay-ccName iframe').locator('[aria-label="Name on Card"]').fill('ROBOT');
    await page.frameLocator('#bigpaypay-ccCvv iframe').locator('[aria-label="CVV"]').fill('123');
    await page.locator('text=Place Order').click();
    await page.waitForURL('https://a67e6yxkbb.myprivaterelay.com/checkout/order-confirmation');
}

