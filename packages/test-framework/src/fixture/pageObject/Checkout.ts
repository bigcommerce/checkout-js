import { Address } from '@bigcommerce/checkout-sdk';
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

    async completeCustomerStepAsGuest(email = `test@example.com`): Promise<void> {
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
        address,
        addressAppendText = '',
    }: {
        formId: string;
        address: Address;
        addressAppendText: string;
    }): Promise<void> {
        await this.page.locator(`${formId}`).waitFor({ state: 'visible' });
        await this.page
            .locator(`${formId} [data-test="firstNameInput-text"]`)
            .fill(`${address.firstName} ${addressAppendText}`);
        await this.page
            .locator(`${formId} [data-test="lastNameInput-text"]`)
            .fill(`${address.lastName} ${addressAppendText}`);
        await this.page.locator(`${formId} [data-test="companyInput-text"]`).fill(address.company);
        await this.page.locator(`${formId} [data-test="phoneInput-text"]`).fill(address.phone);
        await this.page
            .locator(`${formId} [data-test="addressLine1Input-text"]`)
            .fill(`${address.address1} ${addressAppendText}`);
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
        address: Address,
        isBillingAddressSame = true,
        shouldSaveAddress = true,
        addressAppendText?: string,
    ): Promise<void> {
        await this.page
            .locator('[data-test="shipping-address-heading"]')
            .waitFor({ state: 'visible' });

        await this.fillAddressForm({
            formId: '#checkoutShippingAddress',
            address,
            addressAppendText,
        });

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

    async completeBillingAddressForm(address: Address): Promise<void> {
        await this.page
            .locator('[data-test="billing-address-heading"]')
            .waitFor({ state: 'visible' });

        await this.fillAddressForm({ formId: '#checkoutBillingAddress', address });

        await this.page.locator('#checkout-billing-continue').click();
    }

    async fillNewAddressPopup(address: Address, addressAppendText: string): Promise<void> {
        await this.page.locator('.dropdownMenu').waitFor({ state: 'visible' });
        await this.page.locator('.dropdownMenu li').nth(0).click();
        await this.page
            .locator('.ReactModalPortal .modal.optimizedCheckout-contentPrimary')
            .waitFor({ state: 'visible' });
        await this.fillAddressForm({
            formId: '[data-test="modal-body"] .checkout-address',
            address,
            addressAppendText,
        });
        await this.page.locator('#checkout-save-address').click();
    }
}
