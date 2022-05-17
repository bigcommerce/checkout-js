import { Page } from '@playwright/test';

// TODO: Use direct API calls to create a cart
export default class ApiRequestsSender {
    /**
     * @internal
     */
    private readonly page: Page;
    private readonly storeURL: string;

    constructor(page: Page, storeURL: string) {
        this.page = page;
        this.storeURL = storeURL;
    }

    async addPhysicalItemToCart(): Promise<void> {
        // hack for BC dev store's root certificate issue during recording HAR
        // https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const page = this.page;
        await page.goto(this.storeURL + '/cart.php?action=add&product_id=86');
        // page.request.post();
        await page.locator('text=Check out').click();
    }

    async completeCustomerStepAsGuest(): Promise<void> {
        const page = this.page;
        // Fill input[name="email"]
        await page.locator('input[name="email"]').fill('test@robot.com');
        // Click [data-test="customer-continue-as-guest-button"]
        await page.locator('[data-test="customer-continue-as-guest-button"]').click();
    }

    async completeShippingStepAndSkipBilling(): Promise<void> {
        const page = this.page;
        // Fill [data-test="firstNameInput-text"]
        await page.locator('[data-test="firstNameInput-text"]').fill('BAD');
        // Press Tab
        await page.locator('[data-test="firstNameInput-text"]').press('Tab');
        // Fill [data-test="lastNameInput-text"]
        await page.locator('[data-test="lastNameInput-text"]').fill('ROBOT');
        // Click [data-test="addressLine1Input-text"]
        await page.locator('[data-test="addressLine1Input-text"]').click();
        // Fill [data-test="addressLine1Input-text"]
        await page.locator('[data-test="addressLine1Input-text"]').fill('1000 5TH Ave');
        // Fill [data-test="cityInput-text"]
        await page.locator('[data-test="cityInput-text"]').fill('NEW YORK');
        // Select US
        await page.locator('[data-test="countryCodeInput-select"]').selectOption('US');
        // Select NY
        await page.locator('[data-test="provinceCodeInput-select"]').selectOption('NY');
        // Click [data-test="postCodeInput-text"]
        await page.locator('[data-test="postCodeInput-text"]').click();
        // Fill [data-test="postCodeInput-text"]
        await page.locator('[data-test="postCodeInput-text"]').fill('10028');
        // Click text=Continue
        await page.locator('text=Continue').click();
        await page.waitForLoadState('networkidle');
    }
}
