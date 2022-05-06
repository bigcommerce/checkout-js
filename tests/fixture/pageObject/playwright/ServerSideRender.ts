import { Page } from '@playwright/test';

// TODO: Server-side rendering
export default class ServerSideRender {
    /**
     * @internal
     */
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // async renderCheckoutAndOrderConfirmation({ cartId, orderId }: { cartId: string; orderId: number }): Promise<void> {
    async renderCheckoutAndOrderConfirmation(): Promise<void> {
        const page = this.page;
        await page.route('/', route => route.fulfill({status: 200, path: './tests/support/index.html'}));
        await page.route('**/order-confirmation', route => route.fulfill({
            status: 200,
            path: './tests/support/orderConfirmation.html',
        }));
        await page.route('**/products/**/ablebrewingsystem4.1647253530.190.285.jpg?c=1', route => route.fulfill({
            status: 200,
            path: './tests/support/product.jpg',
        }));
    }
}
