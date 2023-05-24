import { screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { SetupServer, setupServer } from 'msw/node';

import {
    cart,
    cartWithBillingEmail,
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
        await waitFor(() => screen.getByText(/shipping method/i));
    }

    async waitForBillingStep(): Promise<void> {
        await waitFor(() => screen.getByText(/billing address/i));
    }

    async waitForPaymentStep(): Promise<void> {
        await waitFor(() => screen.getByText(/place order/i));
    }
}
