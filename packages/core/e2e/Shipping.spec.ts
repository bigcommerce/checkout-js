import { CustomerStepPreset, test } from '@bigcommerce/checkout/test-framework';

test.describe('Shipping', () => {
    const address = {
        firstName: `testFirstName`,
        lastName: `testLastName`,
        company: '',
        phone: '',
        address1: `123 test`,
        address2: '',
        city: 'New York',
        countryCode: 'US',
        stateOrProvince: '',
        postalCode: '12333',
        shouldSaveAddress: false,
        stateOrProvinceCode: 'NY',
        customFields: [],
    };

    test('`Shipping with Guest checkout`', async ({ assertions, checkout }) => {
        // Testing environment setup
        await checkout.use(new CustomerStepPreset(1, false));
        await checkout.start('Shipping with Guest checkout');

        // Playwright actions
        await checkout.goto();
        await checkout.completeCustomerStepAsGuest();
        await checkout.completeShippingAddressForm(address);

        // Assertions
        await assertions.shouldSeePaymentStep();
    });

    test('`Shipping with Guest checkout with different billing address`', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await checkout.use(new CustomerStepPreset(1, false));
        await checkout.start('Shipping with different billing address');

        // Playwright actions
        await checkout.goto();
        await checkout.completeCustomerStepAsGuest();
        await checkout.completeShippingAddressForm(address, false);
        await checkout.completeBillingAddressForm(address);

        // Assertions
        await assertions.shouldSeePaymentStep();

    });

    test('`Shipping with Customer checkout`', async ({ assertions, checkout }) => {
        // Testing environment setup
        await checkout.use(new CustomerStepPreset(1, false));
        await checkout.start('Shipping with Customer checkout');

        // Playwright actions
        await checkout.goto();
        await checkout.completeCustomerStep("test@example.com", "test@123");
        await checkout.completeShippingAddressForm(address, true, false);

        // Assertions
        await assertions.shouldSeePaymentStep();
    });

    test('`Multi Shipping with Customer checkout`', async ({ assertions, checkout, page }) => {
        // Testing environment setup
        await checkout.use(new CustomerStepPreset(2, false));
        await checkout.start('Multi Shipping with Customer checkout');

        // Playwright actions
        await checkout.goto();
        await checkout.completeCustomerStep("test1@example.com", "test@123");
        
        await page.locator('[data-test="shipping-mode-toggle"]').waitFor({ state: 'visible' });
        await page.locator('[data-test="shipping-mode-toggle"]').click();
        await page.locator('.consignmentList').waitFor({ state: 'visible' });

        // add new address for item 1
        const firstItem = page.locator('.consignmentList li').nth(0);

        await firstItem.locator('.consignment-product-body .dropdown--select').click();
        await checkout.fillNewAddressPopup(address, '1');

        // select saved address for item 2
        const secondItem = page.locator('.consignmentList li').nth(1);

        await secondItem.locator('.consignment-product-body .dropdown--select').click();
        await page.locator('.dropdownMenu').waitFor({ state: 'visible' });
        await page.locator('.dropdownMenu li').nth(1).click();

        await page.locator('#checkout-shipping-continue').click();

        await page.locator(`#billingAddresses .dropdown--select`).click();
        await page.locator(`#billingAddresses .dropdownMenu`).waitFor({ state: 'visible' });
        await page.locator(`#billingAddresses .dropdownMenu li`).nth(1).click();

        await page.locator('#checkout-billing-continue').click();

        // Assertions
        await assertions.shouldSeePaymentStep();
    });
});
