import { Checkout } from '@bigcommerce/checkout-sdk';
import { screen, waitFor } from '@testing-library/react';
import { RequestHandler, rest } from 'msw';
import { SetupServer, setupServer } from 'msw/node';

import {
    cart,
    cartReadyForMultiShipping,
    cartWithBillingEmail,
    cartWithCustomShippingAndBilling,
    cartWithoutPhysicalItem,
    cartWithPromotions,
    cartWithShippingAddress,
    cartWithShippingAndBilling,
    checkoutSettings,
    checkoutSettingsWithCustomErrorFlashMessage,
    checkoutSettingsWithErrorFlashMessage,
    checkoutSettingsWithUnsupportedProvider,
    countries,
    formFields,
    payments,
} from './API.mock';

export class CheckoutPageNodeObject {
    private server: SetupServer;

    constructor() {
        const defaultHandlers = [
            rest.get('/api/storefront/checkout/*', (_, res, ctx) => res(ctx.json(cart))),
            rest.get('/api/storefront/checkout-settings', (_, res, ctx) =>
                res(ctx.json(checkoutSettings)),
            ),
            rest.get('/api/storefront/form-fields', (_, res, ctx) => res(ctx.json(formFields))),
            rest.get('/api/storefront/payments', (_, res, ctx) => res(ctx.json(payments))),
            rest.get(/\/internalapi\/v1\/(store|shipping)\/countries/, (_, res, ctx) =>
                res(ctx.json(countries)),
            ),
            rest.post('/api/storefront/checkouts/*/billing-address', (_, res, ctx) =>
                res(ctx.json(cartWithBillingEmail)),
            ),
            rest.get('/api/storefront/checkout-extensions', (_, res, ctx) => res(ctx.json([]))),
        ];

        this.server = setupServer(...defaultHandlers);
    }

    goto(): void {
        this.server.listen({
            onUnhandledRequest: 'error',
        });
    }

    close(): void {
        this.server.close();
    }

    resetHandlers(): void {
        this.server.resetHandlers();
    }

    updateCheckout(
        method: 'get' | 'put' | 'delete' | 'post',
        url: string,
        checkout: Checkout,
    ): void {
        let handler: RequestHandler;

        const storeFrontUrl = `/api/storefront${url}`;

        switch (method) {
            case 'delete':
                handler = rest.delete(storeFrontUrl, (_, res, ctx) => res(ctx.json(checkout)));
                break;

            case 'put':
                handler = rest.put(storeFrontUrl, (_, res, ctx) => res(ctx.json(checkout)));
                break;

            case 'post':
                handler = rest.post(storeFrontUrl, (_, res, ctx) => res(ctx.json(checkout)));
                break;

            default:
                handler = rest.get(storeFrontUrl, (_, res, ctx) => res(ctx.json(checkout)));
        }

        this.server.use(handler);
    }

    use(preset: string): void {
        switch (preset) {
            case 'CartWithBillingEmail':
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(cartWithBillingEmail)),
                    ),
                );
                break;

            case 'CartWithPromotions':
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(cartWithPromotions)),
                    ),
                );
                break;

            case 'CartWithShippingAddress':
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(cartWithShippingAddress)),
                    ),
                );
                break;

            case 'CartWithShippingAndBilling':
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(cartWithShippingAndBilling)),
                    ),
                );
                break;

            case 'cartReadyForMultiShipping':
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(cartReadyForMultiShipping)),
                    ),
                );
                break;

            case 'CartWithCustomShippingAndBilling':
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(cartWithCustomShippingAndBilling)),
                    ),
                );
                break;

            case 'CartWithoutPhysicalItem':
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(cartWithoutPhysicalItem)),
                    ),
                );
                break;

            case 'CustomErrorFlashMessage':
                this.server.use(
                    rest.get('/api/storefront/checkout-settings', (_, res, ctx) =>
                        res(ctx.json(checkoutSettingsWithCustomErrorFlashMessage)),
                    ),
                );
                break;

            case 'ErrorFlashMessage':
                this.server.use(
                    rest.get('/api/storefront/checkout-settings', (_, res, ctx) =>
                        res(ctx.json(checkoutSettingsWithErrorFlashMessage)),
                    ),
                );
                break;

            case 'UnsupportedProvider':
                this.server.use(
                    rest.get('/api/storefront/checkout-settings', (_, res, ctx) =>
                        res(ctx.json(checkoutSettingsWithUnsupportedProvider)),
                    ),
                );
                break;

            default:
                throw new Error('Unknown preset name');
        }
    }

    async waitForCustomerStep(): Promise<void> {
        await waitFor(() => screen.getByRole('textbox', { name: /email/i }));
    }

    async waitForShippingStep(): Promise<void> {
        await waitFor(() => screen.getByText(/shipping method/i), { timeout: 20000 });
    }

    async waitForBillingStep(): Promise<void> {
        await waitFor(() => screen.getByText(/billing address/i));
    }

    async waitForPaymentStep(): Promise<void> {
        await waitFor(() => screen.getByText(/place order/i));
    }
}
