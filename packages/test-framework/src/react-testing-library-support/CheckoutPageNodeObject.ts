import { Checkout } from '@bigcommerce/checkout-sdk';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RequestHandler, rest } from 'msw';
import { SetupServer, setupServer } from 'msw/node';

import {
    applepayMethod,
    checkout,
    CheckoutPreset,
    checkoutSettings,
    checkoutSettingsWithCustomErrorFlashMessage,
    checkoutSettingsWithErrorFlashMessage,
    checkoutSettingsWithRemoteProviders,
    checkoutSettingsWithUnsupportedProvider,
    checkoutWithBillingEmail,
    checkoutWithCustomShippingAndBilling,
    checkoutWithDigitalCart,
    checkoutWithLoggedInCustomer,
    checkoutWithMultiShippingCart,
    checkoutWithPromotions,
    checkoutWithShipping,
    checkoutWithShippingAndBilling,
    countries,
    customer,
    customFormFields,
    formFields,
    payments,
    shippingAddress,
} from './mocks';

export class CheckoutPageNodeObject {
    private server: SetupServer;

    constructor() {
        const defaultHandlers = [
            rest.get('/api/storefront/checkout/*', (_, res, ctx) => res(ctx.json(checkout))),
            rest.get('/api/storefront/checkout-settings', (_, res, ctx) =>
                res(ctx.json(checkoutSettings)),
            ),
            rest.get('/api/storefront/form-fields', (_, res, ctx) => res(ctx.json(formFields))),
            rest.get('/api/storefront/payments', (_, res, ctx) => res(ctx.json(payments))),
            rest.get(/\/internalapi\/v1\/(store|shipping)\/countries/, (_, res, ctx) =>
                res(ctx.json(countries)),
            ),
            rest.post('/api/storefront/checkouts/*/billing-address', (_, res, ctx) =>
                res(ctx.json(checkoutWithBillingEmail)),
            ),
            rest.post('/api/storefront/subscriptions', (_, res, ctx) => res(ctx.json({}))),
            rest.get('/api/storefront/checkout-extensions', (_, res, ctx) => res(ctx.json([]))),
            rest.post('/api/storefront/customer', (_, res, ctx) => res(ctx.json({}))),
            rest.post('/internalapi/v1/checkout/customer', (_, res, ctx) => res(ctx.json({}))),
            rest.get('/api/storefront/payments/applepay', (_, res, ctx) =>
                res(ctx.json(applepayMethod)),
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

    updateCheckout(
        method: 'get' | 'put' | 'delete' | 'post',
        url: string,
        checkoutMock: Checkout,
    ): void {
        let handler: RequestHandler;

        const storeFrontUrl = `/api/storefront${url}`;

        switch (method) {
            case 'delete':
                handler = rest.delete(storeFrontUrl, (_, res, ctx) => res(ctx.json(checkoutMock)));
                break;

            case 'put':
                handler = rest.put(storeFrontUrl, (_, res, ctx) => res(ctx.json(checkoutMock)));
                break;

            case 'post':
                handler = rest.post(storeFrontUrl, (_, res, ctx) => res(ctx.json(checkoutMock)));
                break;

            default:
                handler = rest.get(storeFrontUrl, (_, res, ctx) => res(ctx.json(checkoutMock)));
        }

        this.server.use(handler);
    }

    use(preset: CheckoutPreset): void {
        switch (preset) {
            case CheckoutPreset.CheckoutWithBillingEmail:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithBillingEmail)),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutWithBillingEmailAndCustomFormFields:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithBillingEmail)),
                    ),
                    rest.get('/api/storefront/form-fields', (_, res, ctx) =>
                        res(
                            ctx.json({
                                ...formFields,
                                shippingAddress: [
                                    ...formFields.shippingAddress,
                                    ...customFormFields,
                                ],
                            }),
                        ),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutWithLoggedInCustomer:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithLoggedInCustomer)),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutWithCustomShippingAndBilling:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithCustomShippingAndBilling)),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutWithDigitalCart:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithDigitalCart)),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutWithMultiShipping:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithMultiShippingCart)),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutWithPromotions:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithPromotions)),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutWithShipping:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithShipping)),
                    ),
                );
                break;

            case CheckoutPreset.CheckoutWithShippingAndBilling:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithShippingAndBilling)),
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

            case CheckoutPreset.RemoteProviders:
                this.server.use(
                    rest.get('/api/storefront/checkout-settings', (_, res, ctx) =>
                        res(ctx.json(checkoutSettingsWithRemoteProviders)),
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

    async fillShippingAddress(): Promise<void> {
        await userEvent.type(await screen.findByLabelText('First Name'), customer.firstName);
        await userEvent.type(screen.getByLabelText('Last Name'), customer.lastName);
        await userEvent.type(
            screen.getByRole('textbox', { name: /address/i }),
            shippingAddress.address1,
        );
        await userEvent.type(screen.getByLabelText('City'), shippingAddress.city);
        await userEvent.selectOptions(
            screen.getByTestId('countryCodeInput-select'),
            shippingAddress.countryCode,
        );
        await userEvent.type(screen.getByLabelText('Postal Code'), shippingAddress.postalCode);
    }
}
