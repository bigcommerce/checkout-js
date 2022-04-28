import { Page } from '@playwright/test';

import { checkout, checkoutConfig, formFields, order } from './_api.mock';
import { pollyInitializer } from './_pollyConfig';
import CheckoutPage from './CheckoutPage';

export default class PaymentStep extends CheckoutPage {

    constructor(page: Page) {
        super(page);
    }

    async goto({ HAR, storeURL }: { HAR: string; storeURL: string }): Promise<void> {
        this.polly = await pollyInitializer({
            mode: this.isReplay ? 'replay' : 'record',
            playwrightContext: this.page,
            recordingName: HAR,
        });

        if (this.isReplay) {
            this.polly?.server.any().on('request', req => {
                req.url = req.url.replace('http://localhost:' + process.env.PORT, storeURL);
                // console.log('😃REPLAY ' + req.url);
            });

            // TODO: refactoring API mockups ans run server-side rendering
            // Serve static files and API mockups
            const page = this.page;
            await page.route('/', route => route.fulfill( {status: 200, path: './tests/_support/index.html' } ));
            await page.route('**/order-confirmation', route => route.fulfill( {status: 200, path: './tests/_support/orderConfirmation.html' } ));
            await page.route('**/ablebrewingsystem4.1647253530.190.285.jpg?c=1', route => route.fulfill( {status: 200, path: './tests/_support/product.jpg' } ));
            await page.route('/api/storefront/checkout/*', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(checkout) } ));
            await page.route('/api/storefront/checkout-settings', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(checkoutConfig) } ));
            await page.route('/api/storefront/form-fields', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(formFields) } ));
            await page.route('/api/storefront/orders/*', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(order) } ));

            await this.gotoLocalCheckoutPage();
        } else {
            this.removeBootstrapRequests();
            this.removeSensitiveHeaders();
            await this.createCartOn(storeURL);
        }
    }
}
