/* eslint-disable no-case-declarations */
import {
    type Address,
    type Checkout,
    type CheckoutInitialState,
    type CheckoutService,
    createCheckoutService,
    type FormFields,
} from '@bigcommerce/checkout-sdk/essential';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type RequestHandler, rest } from 'msw';
import { type SetupServer, setupServer } from 'msw/node';
import { act } from 'react';

import {
    applepayMethod,
    checkout,
    CheckoutPreset,
    type CheckoutPresetOverrides,
    checkoutSettings,
    checkoutSettingsWithCustomErrorFlashMessage,
    checkoutSettingsWithErrorFlashMessage,
    checkoutSettingsWithRemoteProviders,
    checkoutSettingsWithUnsupportedProvider,
    checkoutWithBillingEmail,
    checkoutWithCustomerHavingInvalidAddress,
    checkoutWithCustomShippingAndBilling,
    checkoutWithDigitalCart,
    checkoutWithGuestMultiShippingCart,
    checkoutWithLoggedInCustomer,
    checkoutWithMultiShippingAndBilling,
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

    setRequestHandler(handler: RequestHandler) {
        this.server.use(handler);
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

    use(preset: CheckoutPreset, overrides?: CheckoutPresetOverrides): CheckoutService {
        const initialState: CheckoutInitialState = {
            config: { ...checkoutSettings, ...overrides?.config },
            checkout: { ...checkout, ...overrides?.checkout },
            formFields: { ...formFields, ...overrides?.formFields },
            extensions: overrides?.extensions ?? [],
        };

        const checkoutService = createCheckoutService();

        switch (preset) {
            case CheckoutPreset.CheckoutWithBillingEmail:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithBillingEmail)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithBillingEmail, ...overrides?.checkout },
                });
                break;

            case CheckoutPreset.CheckoutWithBillingEmailAndCustomFormFields:
                const formFieldsOverrides: FormFields = {
                    ...formFields,
                    shippingAddress: [...formFields.shippingAddress, ...customFormFields],
                    billingAddress: [...formFields.billingAddress, ...customFormFields],
                };

                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithBillingEmail)),
                    ),
                    rest.get('/api/storefront/form-fields', (_, res, ctx) =>
                        res(ctx.json(formFieldsOverrides)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithBillingEmail, ...overrides?.checkout },
                    formFields: formFieldsOverrides,
                });
                break;

            case CheckoutPreset.CheckoutWithLoggedInCustomer:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithLoggedInCustomer)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: {
                        ...checkoutWithLoggedInCustomer,
                        ...overrides?.checkout,
                    },
                });
                break;

            case CheckoutPreset.CheckoutWithCustomerHavingInvalidAddress:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithCustomerHavingInvalidAddress)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: {
                        ...checkoutWithCustomerHavingInvalidAddress,
                        ...overrides?.checkout,
                    },
                });
                break;

            case CheckoutPreset.CheckoutWithCustomShippingAndBilling:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithCustomShippingAndBilling)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: {
                        ...checkoutWithCustomShippingAndBilling,
                        ...overrides?.checkout,
                    },
                });
                break;

            case CheckoutPreset.CheckoutWithDigitalCart:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithDigitalCart)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithDigitalCart, ...overrides?.checkout },
                });
                break;

            case CheckoutPreset.CheckoutWithMultiShippingCart:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithMultiShippingCart)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithMultiShippingCart, ...overrides?.checkout },
                });
                break;

            case CheckoutPreset.CheckoutWithGuestMultiShippingCart:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithGuestMultiShippingCart)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithGuestMultiShippingCart, ...overrides?.checkout },
                });
                break;

            case CheckoutPreset.CheckoutWithMultiShippingAndBilling:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithMultiShippingAndBilling)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: {
                        ...checkoutWithMultiShippingAndBilling,
                        ...overrides?.checkout,
                    },
                });
                break;

            case CheckoutPreset.CheckoutWithPromotions:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithPromotions)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithPromotions, ...overrides?.checkout },
                });
                break;

            case CheckoutPreset.CheckoutWithShipping:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithShipping)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithShipping, ...overrides?.checkout },
                });
                break;

            case CheckoutPreset.CheckoutWithShippingAndBilling:
                this.server.use(
                    rest.get('/api/storefront/checkout/*', (_, res, ctx) =>
                        res(ctx.json(checkoutWithShippingAndBilling)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithShippingAndBilling, ...overrides?.checkout },
                });
                break;

            case CheckoutPreset.CustomErrorFlashMessage:
                this.server.use(
                    rest.get('/api/storefront/checkout-settings', (_, res, ctx) =>
                        res(ctx.json(checkoutSettingsWithCustomErrorFlashMessage)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    config: {
                        ...checkoutSettingsWithCustomErrorFlashMessage,
                        ...overrides?.config,
                    },
                });
                break;

            case CheckoutPreset.ErrorFlashMessage:
                this.server.use(
                    rest.get('/api/storefront/checkout-settings', (_, res, ctx) =>
                        res(ctx.json(checkoutSettingsWithErrorFlashMessage)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    config: { ...checkoutSettingsWithErrorFlashMessage, ...overrides?.config },
                });
                break;

            case CheckoutPreset.UnsupportedProvider:
                this.server.use(
                    rest.get('/api/storefront/checkout-settings', (_, res, ctx) =>
                        res(ctx.json(checkoutSettingsWithUnsupportedProvider)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    config: {
                        ...checkoutSettingsWithUnsupportedProvider,
                        ...overrides?.config,
                    },
                });
                break;

            case CheckoutPreset.RemoteProviders:
                this.server.use(
                    rest.get('/api/storefront/checkout-settings', (_, res, ctx) =>
                        res(ctx.json(checkoutSettingsWithRemoteProviders)),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    config: { ...checkoutSettingsWithRemoteProviders, ...overrides?.config },
                });
                break;

            default:
                throw new Error('Unknown preset name');
        }

        return checkoutService;
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
        await waitFor(() => screen.getByText(/place order/i), { timeout: 20000 });
    }

    async fillAddressForm(testingAddress: Partial<Address> = {}): Promise<void> {
        await act(async () => {
            const defaultAddress = {
                firstName: customer.firstName,
                lastName: customer.lastName,
                address1: shippingAddress.address1,
                city: shippingAddress.city,
                countryCode: shippingAddress.countryCode,
                postalCode: shippingAddress.postalCode,
            };
            const address = { ...defaultAddress, ...testingAddress };

            await userEvent.clear(await screen.findByLabelText(/Apartment/));
            await userEvent.clear(await screen.findByLabelText(/Company Name/));

            await userEvent.clear(await screen.findByLabelText('Postal Code'));
            await userEvent.clear(await screen.findByLabelText('City'));
            await userEvent.clear(await screen.findByRole('textbox', { name: /address/i }));
            await userEvent.clear(await screen.findByLabelText('First Name'));
            await userEvent.clear(await screen.findByLabelText('Last Name'));

            await userEvent.type(await screen.findByLabelText('First Name'), address.firstName);
            await userEvent.type(await screen.findByLabelText('Last Name'), address.lastName);
            await userEvent.type(
                screen.getByRole('textbox', { name: /address/i }),
                address.address1,
            );
            await userEvent.type(await screen.findByLabelText('City'), address.city);
            await userEvent.selectOptions(
                screen.getByTestId('countryCodeInput-select'),
                address.countryCode,
            );

            if (address.stateOrProvinceCode) {
                await userEvent.selectOptions(
                    screen.getByTestId('provinceCodeInput-select'),
                    address.stateOrProvinceCode,
                );
            } else if (address.stateOrProvince) {
                await userEvent.clear(await screen.findByLabelText('State/Province (Optional)'));
                await userEvent.type(
                    screen.getByLabelText('State/Province (Optional)'),
                    address.stateOrProvince,
                );
            }

            await userEvent.type(screen.getByLabelText('Postal Code'), address.postalCode);
        });
    }
}
