import { Checkout } from '@bigcommerce/checkout-sdk';
import { screen, waitFor } from '@testing-library/react';
import { RequestHandler, rest } from 'msw';
import { SetupServer, setupServer } from 'msw/node';

import {
    CheckoutPreset,
    checkoutReadyForBillingStepWithSingleShipping,
    checkoutReadyForCustomerStep,
    checkoutReadyForCustomerStepWithDigitalCart,
    checkoutReadyForCustomerStepWithPromotions,
    checkoutReadyForMultiShipping,
    checkoutReadyForPaymentStep,
    checkoutReadyForPaymentStepWithCustomShippingOption,
    checkoutReadyForShippingStepWithGuestEmail,
    checkoutSettings,
    checkoutSettingsWithCustomErrorFlashMessage,
    checkoutSettingsWithErrorFlashMessage,
    checkoutSettingsWithUnsupportedProvider,
    countries,
    formFields,
    payments,
} from './mocks';

export class CheckoutPageNodeObject {
    private server: SetupServer;

    constructor() {
        const defaultHandlers = [
            rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                res(ctx.json(checkoutReadyForCustomerStep)),
            ),
            rest.get('/api/storefront/checkout-settings', (_, res, ctx) =>
                res(ctx.json(checkoutSettings)),
            ),
            rest.get('/api/storefront/form-fields', (_, res, ctx) => res(ctx.json(formFields))),
            rest.get('/api/storefront/payments', (_, res, ctx) => res(ctx.json(payments))),
            rest.get(/\/internalapi\/v1\/(store|shipping)\/countries/, (_, res, ctx) =>
                res(ctx.json(countries)),
            ),
            rest.post('/api/storefront/checkouts/*/billing-address', (_, res, ctx) =>
                res(ctx.json(checkoutReadyForShippingStepWithGuestEmail)),
            ),
            rest.post('/api/storefront/subscriptions', (_, res, ctx) => res(ctx.json({}))),
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

    use(preset: CheckoutPreset): void {
        switch (preset) {
            case CheckoutPreset.CheckoutWithBillingEmail:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutReadyForShippingStepWithGuestEmail)),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutWithPromotions:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutReadyForCustomerStepWithPromotions)),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutWithShippingAddress:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutReadyForBillingStepWithSingleShipping)),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutWithShippingAndBilling:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutReadyForPaymentStep)),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutReadyForMultiShipping:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutReadyForMultiShipping)),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutWithCustomShippingAndBilling:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutReadyForPaymentStepWithCustomShippingOption)),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutWithoutPhysicalItem:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutReadyForCustomerStepWithDigitalCart)),
                    ),
                );
                break;

            case CheckoutPreset.CustomErrorFlashMessage:
                this.server.use(
                    rest.get('/api/storefront/checkout-settings', (_, res, ctx) =>
                        res(ctx.json(checkoutSettingsWithCustomErrorFlashMessage)),
                    ),
                );
                break;

            case CheckoutPreset.ErrorFlashMessage:
                this.server.use(
                    rest.get('/api/storefront/checkout-settings', (_, res, ctx) =>
                        res(ctx.json(checkoutSettingsWithErrorFlashMessage)),
                    ),
                );
                break;

            case CheckoutPreset.UnsupportedProvider:
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
