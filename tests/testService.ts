import { expect , test as base, Page } from '@playwright/test';
import { Polly } from '@pollyjs/core';

import { checkout, checkoutConfig, formFields, order } from './api.mock';
import { pollyInitializer } from './pollyConfig';

class TestService {
    readonly page: Page;
    readonly isReplay: boolean;
    polly: Polly | undefined;
    private _storeURL: string;

    constructor(page: Page) {
        this.page = page;
        this.isReplay = process.env.MODE?.toLowerCase() === 'replay';
        this._storeURL = '';
    }

    async gotoPaymentStep({ HAR, storeURL }: { HAR: string; storeURL: string }): Promise<void> {
        this._storeURL = storeURL;
        this.polly = await pollyInitializer({
            mode: this.isReplay ? 'replay' : 'record',
            playwrightContext: this.page,
            recordingName: HAR,
        });
        this.removeBootstrapRequests();
        this.removeSensitiveHeaders();
        await this.createCart();
    }

    async shouldSeeOrderConfirmation(): Promise<void> {
        await this.page.locator('.orderConfirmation').waitFor({state: 'visible'});
        await expect(this.page.locator('data-test=order-confirmation-heading')).toContainText('Thank you');
        await expect(this.page.locator('data-test=order-confirmation-order-number-text')).toContainText(/Your order number is \d*/);
    }

    private async createCart(): Promise<void> {
        const page = this.page;

        if (this.isReplay) {
            // Match URLs in HAR
            this.polly?.server.any().on('request', req => {
                req.url = req.url.replace('http://localhost:' + process.env.PORT, this._storeURL);
                // console.log('😃REPLAY ' + req.url);
            });

            // Serve static files and API mockups
            await page.route('/', route => route.fulfill( {status: 200, path: './tests/_support/index.html' } ));
            await page.route('**/order-confirmation', route => route.fulfill( {status: 200, path: './tests/_support/orderConfirmation.html' } ));
            await page.route('**/ablebrewingsystem4.1647253530.190.285.jpg?c=1', route => route.fulfill( {status: 200, path: './tests/_support/product.jpg' } ));
            await page.route('/api/storefront/checkout/*', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(checkout) } ));
            await page.route('/api/storefront/checkout-settings', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(checkoutConfig) } ));
            await page.route('/api/storefront/form-fields', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(formFields) } ));
            await page.route('/api/storefront/orders/*', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(order) } ));

            // Launch checkout page
            await page.goto('/');
        } else {
            // TODO: Use direct API calls to create a cart
            // Launch local checkout page
            await page.goto(this.isReplay ? '/' : this._storeURL);
            // Click [data-test="card-86"] >> text=Add to Cart
            await page.locator('[data-test="card-86"] >> text=Add to Cart').click();
            // assert.equal(page.url(), 'https://my-dev-store-745516528.store.bcdev/cart.php?suggest=ae7a82e0-fd10-4df5-9dc3-f23a7f5c5aa2');
            // Click text=Check out
            await page.locator('text=Check out').click();
            // assert.equal(page.url(), 'https://my-dev-store-745516528.store.bcdev/checkout');
            // Fill input[name="email"]
            await page.locator('input[name="email"]').fill('test@robot.com');
            // Click [data-test="customer-continue-as-guest-button"]
            await page.locator('[data-test="customer-continue-as-guest-button"]').click();
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
        }
    }

    private removeSensitiveHeaders(): void {
        if (!this.isReplay) {
            this.polly?.server.any().on('beforePersist', (_, recording) => {
                const processHeaders = (headers: []): {} => {
                    const dummyData = '*';
                    const sensitiveHeaderNames = [
                        'authorization',
                        'cookie',
                        'set-cookie',
                        'token',
                        'x-session-hash',
                        'x-xsrf-token',
                    ];

                    return headers.map((header: { name: string; value: string }) => {
                        if (sensitiveHeaderNames.includes(header.name)) {
                            return { ...header, value: dummyData };
                        }

                        return header;
                    });
                };

                recording.request.headers = processHeaders(recording.request.headers);
                recording.response.headers = processHeaders(recording.response.headers);
            });
        }
    }

    private removeBootstrapRequests(): void {
        if (!this.isReplay) {
            // hack for BC dev store's root certificate issue during recording HAR
            // https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

            this.polly?.server.any().intercept((req, _, interceptor) => {
                const ignoredRequests = [
                    'amazonaws.com',
                    'icon-sprite.svg',
                    '/api/storefront/carts/',
                    '/api/storefront/checkout/',
                    '/api/storefront/checkouts/',
                    '/api/storefront/checkout-settings',
                    '/api/storefront/form-fields',
                    '/api/storefront/orders/',
                    '/internalapi/v1/shipping/countries',
                ];
                if (ignoredRequests.some(item => req.url.includes(item))) {
                    // console.log('🚫PASS   ' + req.url);
                    interceptor.passthrough();
                } else {
                    // console.log('😃RECORD ' + req.url);
                    interceptor.abort();
                }
            });
        }
    }
}

interface CheckoutFixtures {
    testService: TestService;
}

export const test = base.extend<CheckoutFixtures>({
    testService: async ({ page }, use) => {
        const testService = new TestService(page);
        await use(testService);
        await testService.polly?.stop();
        await page.close();
    },
});

export { expect };
