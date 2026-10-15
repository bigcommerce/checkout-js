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
import { http, HttpResponse, type RequestHandler } from 'msw';
import { type SetupServer, setupServer } from 'msw/node';
import { act } from 'react';

import {
    addressExtraFields,
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
            http.get('/api/storefront/checkout/*', () => HttpResponse.json(checkout)),
            http.get('/api/storefront/checkout-settings', () =>
                HttpResponse.json(checkoutSettings),
            ),
            http.get('/api/storefront/form-fields', () => HttpResponse.json(formFields)),
            http.get('/api/storefront/payments', () => HttpResponse.json(payments)),
            http.get(/\/internalapi\/v1\/(store|shipping)\/countries/, () =>
                HttpResponse.json(countries),
            ),
            http.post('/api/storefront/checkouts/*/billing-address', () =>
                HttpResponse.json(checkoutWithBillingEmail),
            ),
            http.post('/api/storefront/subscriptions', () => HttpResponse.json({})),
            http.get('/api/storefront/checkout-extensions', () => HttpResponse.json([])),
            http.post('/api/storefront/customer', () => HttpResponse.json({})),
            http.post('/internalapi/v1/checkout/customer', () => HttpResponse.json({})),
            http.get('/api/storefront/payments/applepay', () => HttpResponse.json(applepayMethod)),
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
                handler = http.delete(storeFrontUrl, () => HttpResponse.json(checkoutMock));
                break;

            case 'put':
                handler = http.put(storeFrontUrl, () => HttpResponse.json(checkoutMock));
                break;

            case 'post':
                handler = http.post(storeFrontUrl, () => HttpResponse.json(checkoutMock));
                break;

            default:
                handler = http.get(storeFrontUrl, () => HttpResponse.json(checkoutMock));
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
                    http.get('/api/storefront/checkout/*', () =>
                        HttpResponse.json(checkoutWithBillingEmail),
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
                    http.get('/api/storefront/checkout/*', () =>
                        HttpResponse.json(checkoutWithBillingEmail),
                    ),
                    http.get('/api/storefront/form-fields', () =>
                        HttpResponse.json(formFieldsOverrides),
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
                    http.get('/api/storefront/checkout/*', () =>
                        HttpResponse.json(checkoutWithLoggedInCustomer),
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
                    http.get('/api/storefront/checkout/*', () =>
                        HttpResponse.json(checkoutWithCustomerHavingInvalidAddress),
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
                    http.get('/api/storefront/checkout/*', () =>
                        HttpResponse.json(checkoutWithCustomShippingAndBilling),
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
                    http.get('/api/storefront/checkout/*', () =>
                        HttpResponse.json(checkoutWithDigitalCart),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithDigitalCart, ...overrides?.checkout },
                });
                break;

            case CheckoutPreset.CheckoutWithMultiShippingCart:
                this.server.use(
                    http.get('/api/storefront/checkout/*', () =>
                        HttpResponse.json(checkoutWithMultiShippingCart),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithMultiShippingCart, ...overrides?.checkout },
                });
                break;

            case CheckoutPreset.CheckoutWithGuestMultiShippingCart:
                this.server.use(
                    http.get('/api/storefront/checkout/*', () =>
                        HttpResponse.json(checkoutWithGuestMultiShippingCart),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithGuestMultiShippingCart, ...overrides?.checkout },
                });
                break;

            case CheckoutPreset.CheckoutWithMultiShippingAndBilling:
                this.server.use(
                    http.get('/api/storefront/checkout/*', () =>
                        HttpResponse.json(checkoutWithMultiShippingAndBilling),
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
                    http.get('/api/storefront/checkout/*', () =>
                        HttpResponse.json(checkoutWithPromotions),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithPromotions, ...overrides?.checkout },
                });
                break;

            case CheckoutPreset.CheckoutWithShipping:
                this.server.use(
                    http.get('/api/storefront/checkout/*', () =>
                        HttpResponse.json(checkoutWithShipping),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithShipping, ...overrides?.checkout },
                });
                break;

            case CheckoutPreset.CheckoutWithShippingAndAddressExtraFields:
                this.server.use(
                    http.get('/api/storefront/checkout/*', () =>
                        HttpResponse.json(checkoutWithShipping),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithShipping, ...overrides?.checkout },
                    extraFields: { address: addressExtraFields, order: [] },
                });
                break;

            case CheckoutPreset.CheckoutWithShippingAndBilling:
                this.server.use(
                    http.get('/api/storefront/checkout/*', () =>
                        HttpResponse.json(checkoutWithShippingAndBilling),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    checkout: { ...checkoutWithShippingAndBilling, ...overrides?.checkout },
                });
                break;

            case CheckoutPreset.CustomErrorFlashMessage:
                this.server.use(
                    http.get('/api/storefront/checkout-settings', () =>
                        HttpResponse.json(checkoutSettingsWithCustomErrorFlashMessage),
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
                    http.get('/api/storefront/checkout-settings', () =>
                        HttpResponse.json(checkoutSettingsWithErrorFlashMessage),
                    ),
                );

                void checkoutService.hydrateInitialState({
                    ...initialState,
                    config: { ...checkoutSettingsWithErrorFlashMessage, ...overrides?.config },
                });
                break;

            case CheckoutPreset.UnsupportedProvider:
                this.server.use(
                    http.get('/api/storefront/checkout-settings', () =>
                        HttpResponse.json(checkoutSettingsWithUnsupportedProvider),
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
                    http.get('/api/storefront/checkout-settings', () =>
                        HttpResponse.json(checkoutSettingsWithRemoteProviders),
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
        await waitFor(() => screen.getByRole('textbox', { name: /email/i }), { timeout: 20000 });
    }

    async waitForShippingStep(): Promise<void> {
        await waitFor(() => screen.getByText(/shipping method/i), { timeout: 20000 });
    }

    async waitForBillingStep(): Promise<void> {
        await waitFor(() => screen.getByText(/billing address/i), { timeout: 20000 });
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
