import { Page } from '@playwright/test';

import { CheckoutPagePreset } from '../../';

import { PlaywrightHelper } from '.';

export class Checkout {
    private readonly page: Page;
    private readonly playwright: PlaywrightHelper;
    private harFileName = '';
    private harFolderPath = '';
    private openedCheckout = false;
    private usedPreset = false;

    constructor(page: Page) {
        this.page = page;
        this.playwright = new PlaywrightHelper(page);
    }

    // CheckoutFixtures helper, only used in ../CheckoutFixtures.ts
    setHarFolderPath(file: string): void {
        const regex = /packages(.+)e2e\//g;
        const currentTestFilePath = regex.exec(file);

        if (!currentTestFilePath) {
            throw new Error(
                "Unable to create HAR file. Please place the test file in a package's 'e2e' folder.",
            );
        }

        const harFolderName = `__har__`;

        this.harFolderPath = `./${currentTestFilePath[0]}${harFolderName}`;
    }

    async close(): Promise<void> {
        if (!this.harFileName || !this.usedPreset || !this.openedCheckout) {
            throw new Error(
                'Unable to run the test. Please use all three essential helper functions: checkout.use(), checkout.start(), checkout.goto().',
            );
        }

        await this.playwright.stopAll();
    }

    // Dev helper
    log(): void {
        this.playwright.enableDevMode();
    }

    // Testing environment setup helpers
    async use(preset: CheckoutPagePreset): Promise<void> {
        this.usedPreset = true;
        await this.playwright.usePreset(preset);
    }

    async start(har: string): Promise<void> {
        this.harFileName = har;
        await this.playwright.useHAR(har, this.harFolderPath);
    }

    async route(
        url: string | RegExp | ((url: URL) => boolean),
        filePath: string,
        data?: Record<string, unknown>,
    ): Promise<void> {
        if (data && typeof data !== 'object') {
            throw new Error(
                `Unable to render data type '${typeof data}'. Please use 'object' as data type.`,
            );
        }

        await this.playwright.renderAndRoute(url, filePath, data);
    }

    // Abstract low-level HTML identifiers
    async goto(): Promise<void> {
        this.openedCheckout = true;
        await this.playwright.goto();
    }

    async selectPaymentMethod(methodId: string): Promise<void> {
        await this.page.locator(`[data-test=payment-method-${methodId}]`).click();
    }

    async placeOrder(): Promise<void> {
        await this.page.locator('id=checkout-payment-continue').click();
    }

    async applyCoupon(couponCode: string): Promise<void> {
        await this.page.locator('[data-test="cart"] [data-test="redeemable-label"]').click();
        await this.page.locator('[data-test="redeemableEntry-input"]').fill(couponCode);
        await this.page.locator('[data-test="redeemableEntry-submit"]').click();
    }

    async completeCustomerStepAsGuest(): Promise<void> {
        const email = `test@example.com`;

        await this.page
            .locator('[data-test="checkout-customer-guest"]')
            .waitFor({ state: 'visible' });
        await this.page.locator('[data-test="checkout-customer-guest"] #email').fill(email);
        await this.page.locator('[data-test="customer-continue-as-guest-button"]').click();
    }

    async completeCustomerStep(email: string, password: string): Promise<void> {
        await this.page
            .locator('[data-test="checkout-customer-guest"]')
            .waitFor({ state: 'visible' });
        await this.page.locator('#checkout-customer-login').click();
        await this.page
            .locator('[data-test="checkout-customer-returning"]')
            .waitFor({ state: 'visible' });

        await this.page.locator('[data-test="checkout-customer-returning"] #email').fill(email);
        await this.page
            .locator('[data-test="checkout-customer-returning"] #password')
            .fill(password);
        await this.page.locator('#checkout-customer-continue').click();
    }

    async fillAddressForm({
        formId,
        addressAppendText = '',
    }: {
        formId: string;
        addressAppendText: string;
    }): Promise<void> {
        const address = {
            firstName: `testFirstName ${addressAppendText}`,
            lastName: `testLastName ${addressAppendText}`,
            company: '',
            phone: '',
            address1: `123 test ${addressAppendText}`,
            address2: '',
            city: 'New York',
            countryCode: 'US',
            stateOrProvince: '',
            postalCode: '12333',
            shouldSaveAddress: false,
            stateOrProvinceCode: 'NY',
            customFields: [],
        };

        await this.page.locator(`${formId}`).waitFor({ state: 'visible' });
        await this.page
            .locator(`${formId} [data-test="firstNameInput-text"]`)
            .fill(address.firstName);
        await this.page
            .locator(`${formId} [data-test="lastNameInput-text"]`)
            .fill(address.lastName);
        await this.page.locator(`${formId} [data-test="companyInput-text"]`).fill(address.company);
        await this.page.locator(`${formId} [data-test="phoneInput-text"]`).fill(address.phone);
        await this.page
            .locator(`${formId} [data-test="addressLine1Input-text"]`)
            .fill(address.address1);
        await this.page
            .locator(`${formId} [data-test="addressLine2Input-text"]`)
            .fill(address.address2);
        await this.page.locator(`${formId} [data-test="cityInput-text"]`).fill(address.city);
        await this.page
            .locator(`${formId} [data-test="countryCodeInput-select"]`)
            .selectOption(address.countryCode);
        await this.page
            .locator(`${formId} [data-test="provinceCodeInput-select"]`)
            .selectOption(address.stateOrProvinceCode);
        await this.page
            .locator(`${formId} [data-test="postCodeInput-text"]`)
            .fill(address.postalCode);
    }

    async completeShippingAddressForm(
        isBillingAddressSame = true,
        shouldSaveAddress = true,
        addressAppendText?: string,
    ): Promise<void> {
        await this.page
            .locator('[data-test="shipping-address-heading"]')
            .waitFor({ state: 'visible' });

        await this.fillAddressForm({ formId: '#checkoutShippingAddress', addressAppendText });

        if (!isBillingAddressSame) await this.page.locator('label[for="sameAsBilling"]').click();
        if (!shouldSaveAddress)
            await this.page.locator('label[for="shippingAddress.shouldSaveAddress"]').click();

        await this.page.locator('#checkout-shipping-options').waitFor({ state: 'visible' });

        const firstShippingMethod = this.page
            .locator('#checkout-shipping-options .shippingOptions-container li')
            .nth(0);

        await firstShippingMethod.click();
        await this.page.locator('#checkout-shipping-continue').click();
    }

    async completeBillingAddressForm(): Promise<void> {
        await this.page
            .locator('[data-test="billing-address-heading"]')
            .waitFor({ state: 'visible' });

        await this.fillAddressForm({ formId: '#checkoutBillingAddress' });

        await this.page.locator('#checkout-billing-continue').click();
    }

    async fillNewAddressPopup(addressAppendText: string): Promise<void> {
        await this.page.locator('.dropdownMenu').waitFor({ state: 'visible' });
        await this.page.locator('.dropdownMenu li').nth(0).click();
        await this.page
            .locator('.ReactModalPortal .modal.optimizedCheckout-contentPrimary')
            .waitFor({ state: 'visible' });
        await this.fillAddressForm({
            formId: '[data-test="modal-body"] .checkout-address',
            addressAppendText,
        });
        await this.page.locator('#checkout-save-address').click();
    }

    async completeMultiShippingAddressForm(): Promise<void> {
        await this.page.locator('[data-test="shipping-mode-toggle"]').waitFor({ state: 'visible' });
        await this.page.locator('[data-test="shipping-mode-toggle"]').click();
        await this.page.locator('.consignmentList').waitFor({ state: 'visible' });

        const firstItem = this.page.locator('.consignmentList li').nth(0);

        await firstItem.locator('.consignment-product-body .dropdown--select').click();
        await this.fillNewAddressPopup('1');

        const secondItem = this.page.locator('.consignmentList li').nth(1);

        await secondItem.locator('.consignment-product-body .dropdown--select').click();
        await this.fillNewAddressPopup('2');

        await this.page.locator('#checkout-shipping-continue').click();

        await this.page.locator(`#billingAddresses .dropdown--select`).click();
        await this.page.locator(`#billingAddresses .dropdownMenu`).waitFor({ state: 'visible' });
        await this.page.locator(`#billingAddresses .dropdownMenu li`).nth(1).click();

        await this.page.locator('#checkout-billing-continue').click();
    }
}
