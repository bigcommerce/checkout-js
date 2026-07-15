import {
    type CheckoutService,
    createCheckoutService,
    createEmbeddedCheckoutMessenger,
    type EmbeddedCheckoutMessenger,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import { rest } from 'msw';
import React, { act, type FunctionComponent } from 'react';

import { ExtensionService } from '@bigcommerce/checkout/checkout-extension';
import {
    type AnalyticsEvents,
    AnalyticsProviderMock,
    CheckoutProvider,
    defaultCapabilities,
    ExtensionProvider,
    type ExtensionServiceInterface,
    LocaleProvider,
    ThemeProvider,
} from '@bigcommerce/checkout/contexts';
import { getLanguageService } from '@bigcommerce/checkout/locale';
import { CHECKOUT_ROOT_NODE_ID } from '@bigcommerce/checkout/payment-integration-api';
import {
    CheckoutPageNodeObject,
    CheckoutPreset,
    checkoutSettings,
    checkoutWithBillingEmail,
    checkoutWithShippingAndBilling,
    customer,
    orderResponse,
    payments,
} from '@bigcommerce/checkout/test-framework';
import { renderWithoutWrapper as render, screen, waitFor } from '@bigcommerce/checkout/test-utils';
import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import Checkout, { type CheckoutProps } from '../checkout/Checkout';
import { createErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

// Controllable billing save for the themeV2 pre-submit gate. Other tests keep
// themeV2 off, so the block never renders and this stays unused there.

let mockEnsureBillingAddressSaved: jest.Mock<Promise<boolean>>;

jest.mock('./billingForm', () => {
    const ReactActual = require('react');

    const { default: PaymentContextActual } = require('./PaymentContext');

    return {
        PaymentBillingBlock: () => {
            const context = ReactActual.useContext(PaymentContextActual);

            ReactActual.useEffect(() => {
                context?.setEnsureBillingAddressSaved(mockEnsureBillingAddressSaved);
            }, [context]);

            return ReactActual.createElement('div', { 'data-test': 'payment-billing-block' });
        },
    };
});

describe('Payment step', () => {
    let checkout: CheckoutPageNodeObject;
    let CheckoutTest: FunctionComponent<CheckoutProps>;
    let checkoutService: CheckoutService;
    let extensionService: ExtensionServiceInterface;
    let defaultProps: CheckoutProps;
    let embeddedMessengerMock: EmbeddedCheckoutMessenger;
    let analyticsTracker: Partial<AnalyticsEvents>;

    beforeAll(() => {
        checkout = new CheckoutPageNodeObject();
        checkout.goto();
    });

    afterEach(() => {
        checkout.resetHandlers();
        sessionStorage.clear();
    });

    afterAll(() => {
        checkout.close();
    });

    beforeEach(() => {
        window.scrollTo = jest.fn();

        checkoutService = createCheckoutService();
        extensionService = new ExtensionService(checkoutService, createErrorLogger());
        embeddedMessengerMock = createEmbeddedCheckoutMessenger({
            parentOrigin: 'https://store.url',
        });
        defaultProps = {
            checkoutId: checkoutWithBillingEmail.id,
            containerId: CHECKOUT_ROOT_NODE_ID,
            createEmbeddedMessenger: () => embeddedMessengerMock,
            embeddedStylesheet: createEmbeddedCheckoutStylesheet(),
            embeddedSupport: createEmbeddedCheckoutSupport(getLanguageService()),
            errorLogger: createErrorLogger(),
        };

        jest.spyOn(defaultProps.errorLogger, 'log').mockImplementation(noop);
        analyticsTracker = {
            selectedPaymentMethod: jest.fn(),
        };

        CheckoutTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider
                    checkoutService={checkoutService}
                    languageService={getLanguageService()}
                >
                    <AnalyticsProviderMock analyticsTracker={analyticsTracker}>
                        <ExtensionProvider extensionService={extensionService}>
                            <ThemeProvider>
                                <Checkout {...props} />
                            </ThemeProvider>
                        </ExtensionProvider>
                    </AnalyticsProviderMock>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('renders payment step with 2 offline payment methods', async () => {
        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByRole('radio', { name: 'Pay in Store' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Cash on Delivery' })).toBeInTheDocument();
    });

    it('tracks selected payment method on initial load', async () => {
        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(analyticsTracker.selectedPaymentMethod).toHaveBeenCalledWith(
            'Pay in Store',
            'instore',
        );
        expect(analyticsTracker.selectedPaymentMethod).toHaveBeenCalledTimes(1);
    });

    it('selects another payment method and places the order successfully', async () => {
        checkout.setRequestHandler(
            rest.post('/internalapi/v1/checkout/order', (_, res, ctx) =>
                res(ctx.json(orderResponse)),
            ),
        );
        checkout.setRequestHandler(
            rest.get('/api/storefront/orders/*', (_, res, ctx) => res(ctx.json(orderResponse))),
        );

        const location = window.location;

        Object.defineProperty(window, 'location', {
            value: {
                // eslint-disable-next-line @typescript-eslint/no-misused-spread
                ...location,
                replace: jest.fn(),
            },
            writable: true,
        });

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(
            screen.getByRole('radio', { name: 'Pay in Store', checked: true }),
        ).toBeInTheDocument();

        await act(async () =>
            userEvent.click(screen.getByRole('radio', { name: 'Cash on Delivery' })),
        );

        expect(
            await screen.findByRole('radio', { name: 'Cash on Delivery', checked: true }),
        ).toBeInTheDocument();

        await act(async () => userEvent.click(screen.getByText('Place Order')));

        expect(window.location.replace).toHaveBeenCalledWith('/order-confirmation');
    });

    it('does not place the order when embedded billing (themeV2) is invalid', async () => {
        const themeV2Config = {
            ...checkoutSettings,
            storeConfig: {
                ...checkoutSettings.storeConfig,
                checkoutSettings: {
                    ...checkoutSettings.storeConfig.checkoutSettings,
                    checkoutUserExperienceSettings: {
                        ...checkoutSettings.storeConfig.checkoutSettings
                            .checkoutUserExperienceSettings,
                        checkoutV2Theme: true,
                    },
                },
            },
        };

        mockEnsureBillingAddressSaved = jest.fn<Promise<boolean>, []>().mockResolvedValue(false);

        const location = window.location;

        Object.defineProperty(window, 'location', {
            value: {
                // eslint-disable-next-line @typescript-eslint/no-misused-spread
                ...location,
                replace: jest.fn(),
            },
            writable: true,
        });

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
            config: themeV2Config,
        });

        const submitOrderSpy = jest.spyOn(checkoutService, 'submitOrder');

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        await act(async () => userEvent.click(screen.getByText('Place Order')));

        expect(mockEnsureBillingAddressSaved).toHaveBeenCalled();
        expect(submitOrderSpy).not.toHaveBeenCalled();
        expect(window.location.replace).not.toHaveBeenCalled();
    });

    it('disables Place Order while the embedded billing (themeV2) address is being persisted', async () => {
        const themeV2Config = {
            ...checkoutSettings,
            storeConfig: {
                ...checkoutSettings.storeConfig,
                checkoutSettings: {
                    ...checkoutSettings.storeConfig.checkoutSettings,
                    checkoutUserExperienceSettings: {
                        ...checkoutSettings.storeConfig.checkoutSettings
                            .checkoutUserExperienceSettings,
                        checkoutV2Theme: true,
                    },
                },
            },
        };

        mockEnsureBillingAddressSaved = jest.fn<Promise<boolean>, []>().mockResolvedValue(true);

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
            config: themeV2Config,
        });

        // Keep the billing-address update in flight so isUpdatingBillingAddress
        // stays true while we assert the submit button is disabled.
        checkout.setRequestHandler(
            rest.put(
                '/api/storefront/checkouts/*/billing-address/*',
                () => new Promise<never>(() => undefined),
            ),
        );

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        await act(async () => {
            void checkoutService.updateBillingAddress({});
        });

        await waitFor(() =>
            // eslint-disable-next-line jest-dom/prefer-to-have-attribute
            expect(
                screen.getByRole('button', { name: /place order/i }).hasAttribute('disabled'),
            ).toBeTruthy(),
        );
    });

    it('goes back to billing step after unmounting the component', async () => {
        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        await userEvent.click(screen.getByRole('radio', { name: 'Pay in Store' }));
        await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[2]);

        expect(screen.queryByRole('radio')).not.toBeInTheDocument();
        expect(screen.queryByText('Pay in Store')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    });

    it('applies store credit automatically', async () => {
        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
            checkout: {
                ...checkoutWithShippingAndBilling,
                customer: {
                    ...customer,
                    storeCredit: 1000,
                },
            },
        });

        checkout.setRequestHandler(
            rest.post('api/storefront/checkouts/*/store-credit', (_, res, ctx) =>
                res(
                    ctx.json({
                        ...checkoutWithShippingAndBilling,
                        isStoreCreditApplied: true,
                        outstandingBalance: 0,
                        customer: {
                            ...customer,
                            storeCredit: 1000,
                        },
                    }),
                ),
            ),
        );

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByText(/Payment is not required/)).toBeInTheDocument();
    });

    it('does not apply store credit automatically when disableStoreCredit is true', async () => {
        const configWithDisableStoreCredit = {
            ...checkoutSettings,
            storeConfig: {
                ...checkoutSettings.storeConfig,
                checkoutSettings: {
                    ...checkoutSettings.storeConfig.checkoutSettings,
                    capabilities: {
                        ...defaultCapabilities,
                        userJourney: {
                            ...defaultCapabilities.userJourney,
                            disableStoreCredit: true,
                        },
                    },
                },
            },
        };

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
            config: configWithDisableStoreCredit,
            checkout: {
                ...checkoutWithShippingAndBilling,
                isStoreCreditApplied: false,
                customer: {
                    ...customer,
                    storeCredit: 1000,
                },
            },
        });

        const applyStoreCreditSpy = jest.spyOn(checkoutService, 'applyStoreCredit');

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(applyStoreCreditSpy).not.toHaveBeenCalledWith(true);
    });

    it('does not render amazon if multi-shipping', async () => {
        const amazonPay = {
            ...payments[0],
            id: 'amazonpay',
            config: {
                ...payments[0].config,
                displayName: 'Amazon Pay',
            },
        };

        checkout.setRequestHandler(
            rest.get('/api/storefront/payments', (_, res, ctx) =>
                res(ctx.json([payments[0], amazonPay])),
            ),
        );

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithMultiShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByRole('radio')).toBeInTheDocument();
        expect(screen.queryByText('Amazon Pay')).not.toBeInTheDocument();
    });

    it('does not render bolt if showInCheckout is false', async () => {
        const bolt = {
            ...payments[0],
            id: 'bolt',
            initializationData: { showInCheckout: false },
            config: {
                ...payments[0].config,
                displayName: 'Bolt',
            },
        };

        checkout.setRequestHandler(
            rest.get('/api/storefront/payments', (_, res, ctx) =>
                res(ctx.json([payments[0], bolt])),
            ),
        );

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByRole('radio')).toBeInTheDocument();
        expect(screen.queryByText('Bolt')).not.toBeInTheDocument();
    });

    it('does not render methods with braintreelocalmethods id', async () => {
        const braintree = {
            ...payments[0],
            id: 'braintreelocalmethods',
            config: {
                ...payments[0].config,
                displayName: 'BrainTree Local Methods',
            },
        };

        checkout.setRequestHandler(
            rest.get('/api/storefront/payments', (_, res, ctx) =>
                res(ctx.json([payments[0], braintree])),
            ),
        );

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByRole('radio')).toBeInTheDocument();
        expect(screen.queryByText(/BrainTree/)).not.toBeInTheDocument();
    });

    it('groups payment methods that match configured prefix when PAYMENTS-5142 experiment is enabled', async () => {
        const facilypay3 = {
            ...payments[0],
            id: 'facilypay_3',
            config: {
                ...payments[0].config,
                displayName: '3x Oney',
            },
        };
        const facilypay6 = {
            ...payments[0],
            id: 'facilypay_6',
            config: {
                ...payments[0].config,
                displayName: '6x Oney',
            },
        };
        const card = {
            ...payments[0],
            id: 'card',
            config: {
                ...payments[0].config,
                displayName: 'Card',
            },
        };

        const configWithGroupingExperiment = {
            ...checkoutSettings,
            storeConfig: {
                ...checkoutSettings.storeConfig,
                checkoutSettings: {
                    ...checkoutSettings.storeConfig.checkoutSettings,
                    features: {
                        ...checkoutSettings.storeConfig.checkoutSettings.features,
                        'PAYMENTS-5142.payment_method_grouping': true,
                    },
                },
            },
        };

        checkout.setRequestHandler(
            rest.get('/api/storefront/payments', (_, res, ctx) =>
                res(ctx.json([card, facilypay6, facilypay3])),
            ),
        );

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
            config: configWithGroupingExperiment,
        });

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByRole('radio', { name: 'Oney' })).toBeInTheDocument();
        expect(screen.queryByRole('radio', { name: '3x Oney' })).not.toBeInTheDocument();
        expect(screen.queryByRole('radio', { name: '6x Oney' })).not.toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Card' })).toBeInTheDocument();
    });

    it('does not group prefixed payment methods when PAYMENTS-5142 experiment is disabled', async () => {
        const facilypay3 = {
            ...payments[0],
            id: 'facilypay_3',
            config: {
                ...payments[0].config,
                displayName: '3x Oney',
            },
        };
        const facilypay6 = {
            ...payments[0],
            id: 'facilypay_6',
            config: {
                ...payments[0].config,
                displayName: '6x Oney',
            },
        };

        const configWithoutGroupingExperiment = {
            ...checkoutSettings,
            storeConfig: {
                ...checkoutSettings.storeConfig,
                checkoutSettings: {
                    ...checkoutSettings.storeConfig.checkoutSettings,
                    features: {
                        ...checkoutSettings.storeConfig.checkoutSettings.features,
                        'PAYMENTS-5142.payment_method_grouping': false,
                    },
                },
            },
        };

        checkout.setRequestHandler(
            rest.get('/api/storefront/payments', (_, res, ctx) =>
                res(ctx.json([facilypay6, facilypay3])),
            ),
        );

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
            config: configWithoutGroupingExperiment,
        });

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByRole('radio', { name: '3x Oney' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: '6x Oney' })).toBeInTheDocument();
        expect(screen.queryByRole('radio', { name: 'Oney' })).not.toBeInTheDocument();
    });

    it('does not group payment methods when no configured prefix matches', async () => {
        const installments3 = {
            ...payments[0],
            id: 'installments_3',
            config: {
                ...payments[0].config,
                displayName: '3x Installments',
            },
        };
        const installments6 = {
            ...payments[0],
            id: 'installments_6',
            config: {
                ...payments[0].config,
                displayName: '6x Installments',
            },
        };

        checkout.setRequestHandler(
            rest.get('/api/storefront/payments', (_, res, ctx) =>
                res(ctx.json([installments3, installments6])),
            ),
        );

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByRole('radio', { name: '3x Installments' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: '6x Installments' })).toBeInTheDocument();
    });

    it('does not render payment form if there are no methods', async () => {
        checkout.setRequestHandler(
            rest.get('/api/storefront/payments', (_, res, ctx) => res(ctx.json([]))),
        );

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        expect(await screen.findByText('Payment')).toBeInTheDocument();
        expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });

    it('renders error modal if there is error when submitting order', async () => {
        checkout.setRequestHandler(
            rest.post('/internalapi/v1/checkout/order', (_, res, ctx) =>
                res(
                    ctx.status(500),
                    ctx.json({
                        title: 'The tax provider is unavailable.',
                        type: 'order_error',
                    }),
                ),
            ),
        );

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();
        await userEvent.click(screen.getByText('Place Order'));

        expect(screen.getByText("Something's gone wrong")).toBeInTheDocument();

        await userEvent.click(screen.getByText('Ok'));

        expect(screen.queryByText("Something's gone wrong")).not.toBeInTheDocument();
    });

    describe('B2B payment methods refresh', () => {
        const createConfigWithPersistB2BMetadata = () => ({
            ...checkoutSettings,
            storeConfig: {
                ...checkoutSettings.storeConfig,
                checkoutSettings: {
                    ...checkoutSettings.storeConfig.checkoutSettings,
                    capabilities: {
                        ...defaultCapabilities,
                        orderConfirmation: {
                            ...defaultCapabilities.orderConfirmation,
                            persistB2BMetadata: true,
                        },
                    },
                },
            },
        });

        const createConfigWithB2BToken = () => ({
            ...checkoutSettings,
            storeConfig: {
                ...checkoutSettings.storeConfig,
                checkoutSettings: {
                    ...checkoutSettings.storeConfig.checkoutSettings,
                    capabilities: {
                        ...defaultCapabilities,
                        orderConfirmation: {
                            ...defaultCapabilities.orderConfirmation,
                            persistB2BMetadata: true,
                        },
                        userJourney: {
                            ...defaultCapabilities.userJourney,
                            requiresB2BToken: true,
                        },
                    },
                },
            },
        });

        const mockB2BTokenEndpoints = (): void => {
            checkout.setRequestHandler(
                rest.get('/customer/current.jwt', (_, res, ctx) =>
                    res(ctx.json({ token: 'jwt-token' })),
                ),
            );
            checkout.setRequestHandler(
                rest.post('/api/v2/login', (_, res, ctx) =>
                    res(ctx.json({ code: 200, data: { token: 'b2b-token' } })),
                ),
            );
        };

        it('refreshes B2B payment methods on mount when persistB2BMetadata capability is enabled and orderId is present on checkout', async () => {
            mockB2BTokenEndpoints();

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                config: createConfigWithB2BToken(),
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    customer,
                    orderId: 12345,
                },
            });

            const refreshSpy = jest
                .spyOn(checkoutService, 'refreshB2BPaymentMethods')
                .mockImplementation(() => Promise.resolve(checkoutService.getState()));

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            expect(refreshSpy).toHaveBeenCalled();
        });

        it('does not refresh B2B payment methods on mount when checkout has no orderId', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                config: createConfigWithPersistB2BMetadata(),
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    customer,
                },
            });

            const refreshSpy = jest
                .spyOn(checkoutService, 'refreshB2BPaymentMethods')
                .mockImplementation(() => Promise.resolve(checkoutService.getState()));

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            expect(refreshSpy).not.toHaveBeenCalled();
        });

        it('does not refresh B2B payment methods on mount when persistB2BMetadata capability is disabled even when orderId is present', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    orderId: 12345,
                },
            });

            const refreshSpy = jest
                .spyOn(checkoutService, 'refreshB2BPaymentMethods')
                .mockImplementation(() => Promise.resolve(checkoutService.getState()));

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            expect(refreshSpy).not.toHaveBeenCalled();
        });

        it('does not refresh B2B payment methods on mount when there is no b2bToken even though persistB2BMetadata is enabled and orderId is present', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                config: createConfigWithPersistB2BMetadata(),
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    orderId: 12345,
                },
            });

            const refreshSpy = jest
                .spyOn(checkoutService, 'refreshB2BPaymentMethods')
                .mockImplementation(() => Promise.resolve(checkoutService.getState()));

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            expect(refreshSpy).not.toHaveBeenCalled();
        });

        it('refreshes B2B payment methods before submitting order when persistB2BMetadata capability is enabled', async () => {
            checkout.setRequestHandler(
                rest.post('/internalapi/v1/checkout/order', (_, res, ctx) =>
                    res(ctx.json(orderResponse)),
                ),
            );
            checkout.setRequestHandler(
                rest.get('/api/storefront/orders/*', (_, res, ctx) => res(ctx.json(orderResponse))),
            );

            const location = window.location;

            Object.defineProperty(window, 'location', {
                value: {
                    // eslint-disable-next-line @typescript-eslint/no-misused-spread
                    ...location,
                    replace: jest.fn(),
                },
                writable: true,
            });

            mockB2BTokenEndpoints();

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                config: createConfigWithB2BToken(),
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    customer,
                },
            });

            const refreshSpy = jest
                .spyOn(checkoutService, 'refreshB2BPaymentMethods')
                .mockImplementation(() => Promise.resolve(checkoutService.getState()));
            const submitOrderSpy = jest.spyOn(checkoutService, 'submitOrder');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            refreshSpy.mockClear();

            await act(async () => userEvent.click(screen.getByText('Place Order')));

            expect(refreshSpy).toHaveBeenCalledTimes(1);
            expect(submitOrderSpy).toHaveBeenCalledTimes(1);

            const refreshCallOrder = refreshSpy.mock.invocationCallOrder[0];
            const submitOrderCallOrder = submitOrderSpy.mock.invocationCallOrder[0];

            expect(refreshCallOrder).toBeLessThan(submitOrderCallOrder);
        });

        it('does not refresh B2B payment methods before submitting order when persistB2BMetadata capability is disabled', async () => {
            checkout.setRequestHandler(
                rest.post('/internalapi/v1/checkout/order', (_, res, ctx) =>
                    res(ctx.json(orderResponse)),
                ),
            );
            checkout.setRequestHandler(
                rest.get('/api/storefront/orders/*', (_, res, ctx) => res(ctx.json(orderResponse))),
            );

            const location = window.location;

            Object.defineProperty(window, 'location', {
                value: {
                    // eslint-disable-next-line @typescript-eslint/no-misused-spread
                    ...location,
                    replace: jest.fn(),
                },
                writable: true,
            });

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

            const refreshSpy = jest
                .spyOn(checkoutService, 'refreshB2BPaymentMethods')
                .mockImplementation(() => Promise.resolve(checkoutService.getState()));

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            await act(async () => userEvent.click(screen.getByText('Place Order')));

            expect(refreshSpy).not.toHaveBeenCalled();
        });

        it('does not refresh B2B payment methods before submitting order when there is no b2bToken', async () => {
            checkout.setRequestHandler(
                rest.post('/internalapi/v1/checkout/order', (_, res, ctx) =>
                    res(ctx.json(orderResponse)),
                ),
            );
            checkout.setRequestHandler(
                rest.get('/api/storefront/orders/*', (_, res, ctx) => res(ctx.json(orderResponse))),
            );

            const location = window.location;

            Object.defineProperty(window, 'location', {
                value: {
                    // eslint-disable-next-line @typescript-eslint/no-misused-spread
                    ...location,
                    replace: jest.fn(),
                },
                writable: true,
            });

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                config: createConfigWithPersistB2BMetadata(),
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    customer,
                },
            });

            const refreshSpy = jest
                .spyOn(checkoutService, 'refreshB2BPaymentMethods')
                .mockImplementation(() => Promise.resolve(checkoutService.getState()));
            const submitOrderSpy = jest.spyOn(checkoutService, 'submitOrder');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            await act(async () => userEvent.click(screen.getByText('Place Order')));

            expect(refreshSpy).not.toHaveBeenCalled();
            expect(submitOrderSpy).toHaveBeenCalledTimes(1);
        });

        it('completes initialization and renders the payment step when mount-time B2B refresh fails', async () => {
            mockB2BTokenEndpoints();

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                config: createConfigWithB2BToken(),
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    customer,
                    orderId: 12345,
                },
            });

            jest.spyOn(checkoutService, 'refreshB2BPaymentMethods').mockRejectedValue(
                new Error('B2B payments refresh failed'),
            );

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            expect(screen.getByText(/place order/i)).toBeInTheDocument();
        });

        it('still submits the order when B2B payment methods refresh fails before submit', async () => {
            checkout.setRequestHandler(
                rest.post('/internalapi/v1/checkout/order', (_, res, ctx) =>
                    res(ctx.json(orderResponse)),
                ),
            );

            mockB2BTokenEndpoints();

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                config: createConfigWithB2BToken(),
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    customer,
                },
            });

            jest.spyOn(checkoutService, 'refreshB2BPaymentMethods').mockRejectedValue(
                new Error('B2B payments refresh failed'),
            );

            const submitOrderSpy = jest.spyOn(checkoutService, 'submitOrder');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            await act(async () => userEvent.click(screen.getByText('Place Order')));

            expect(submitOrderSpy).toHaveBeenCalledTimes(1);
        });

        it('persists B2B metadata after finalizing the order on mount when persistB2BMetadata capability is enabled', async () => {
            const location = window.location;

            Object.defineProperty(window, 'location', {
                value: {
                    // eslint-disable-next-line @typescript-eslint/no-misused-spread
                    ...location,
                    replace: jest.fn(),
                },
                writable: true,
            });

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                config: createConfigWithPersistB2BMetadata(),
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    customer,
                    orderId: 12345,
                },
            });

            jest.spyOn(checkoutService, 'refreshB2BPaymentMethods').mockImplementation(() =>
                Promise.resolve(checkoutService.getState()),
            );
            jest.spyOn(checkoutService, 'finalizeOrderIfNeeded').mockResolvedValue(
                checkoutService.getState(),
            );

            const persistSpy = jest
                .spyOn(checkoutService, 'persistB2BMetadata')
                .mockImplementation(() => Promise.resolve(checkoutService.getState()));

            render(<CheckoutTest {...defaultProps} />);

            await waitFor(() =>
                expect(persistSpy).toHaveBeenCalledWith({
                    isInvoice: false,
                    invoiceComment: undefined,
                    poNumber: undefined,
                    referenceNumber: undefined,
                    extraFields: [],
                    extraInfo: {},
                }),
            );
        });

        it('persists the address extra fields from the checkout object after finalizing on mount', async () => {
            const location = window.location;

            Object.defineProperty(window, 'location', {
                value: {
                    // eslint-disable-next-line @typescript-eslint/no-misused-spread
                    ...location,
                    replace: jest.fn(),
                },
                writable: true,
            });

            const { billingAddress } = checkoutWithShippingAndBilling;
            const [consignment] = checkoutWithShippingAndBilling.consignments;

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                config: createConfigWithPersistB2BMetadata(),
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    customer,
                    orderId: 12345,
                    billingAddress: billingAddress && {
                        ...billingAddress,
                        extraFields: [{ fieldId: '30', fieldValue: 'Finance' }],
                    },
                    consignments: [
                        {
                            ...consignment,
                            shippingAddress: {
                                ...consignment.shippingAddress,
                                extraFields: [{ fieldId: '31', fieldValue: 'B7' }],
                            },
                        },
                    ],
                },
            });

            jest.spyOn(checkoutService, 'refreshB2BPaymentMethods').mockImplementation(() =>
                Promise.resolve(checkoutService.getState()),
            );
            jest.spyOn(checkoutService, 'finalizeOrderIfNeeded').mockResolvedValue(
                checkoutService.getState(),
            );

            const persistSpy = jest
                .spyOn(checkoutService, 'persistB2BMetadata')
                .mockImplementation(() => Promise.resolve(checkoutService.getState()));

            render(<CheckoutTest {...defaultProps} />);

            await waitFor(() =>
                expect(persistSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        extraInfo: {
                            addressExtraFields: {
                                billingAddressExtraFields: [
                                    { fieldName: '30', fieldValue: 'Finance' },
                                ],
                                shippingAddressExtraFields: [{ fieldName: '31', fieldValue: 'B7' }],
                            },
                        },
                    }),
                ),
            );
        });

        it('stores the address IDs returned by the order endpoint, persists them and clears them afterwards', async () => {
            checkout.setRequestHandler(
                rest.post('/internalapi/v1/checkout/order', (_, res, ctx) =>
                    res(
                        ctx.json({
                            ...orderResponse,
                            data: {
                                ...orderResponse.data,
                                b2bContext: { billingAddressId: 111, shippingAddressId: 222 },
                            },
                        }),
                    ),
                ),
            );
            checkout.setRequestHandler(
                rest.get('/api/storefront/orders/*', (_, res, ctx) => res(ctx.json(orderResponse))),
            );

            const location = window.location;

            Object.defineProperty(window, 'location', {
                value: {
                    // eslint-disable-next-line @typescript-eslint/no-misused-spread
                    ...location,
                    replace: jest.fn(),
                },
                writable: true,
            });

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                config: createConfigWithPersistB2BMetadata(),
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    customer,
                },
            });

            jest.spyOn(checkoutService, 'refreshB2BPaymentMethods').mockImplementation(() =>
                Promise.resolve(checkoutService.getState()),
            );

            const persistSpy = jest
                .spyOn(checkoutService, 'persistB2BMetadata')
                .mockImplementation(() => Promise.resolve(checkoutService.getState()));

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            await act(async () => userEvent.click(screen.getByText('Place Order')));

            await waitFor(() =>
                expect(persistSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        extraInfo: {
                            billingAddressId: 111,
                            shipppingAddressId: 222,
                        },
                    }),
                ),
            );

            await waitFor(() =>
                expect(B2BSessionStorage.getAddressIds()).toEqual({
                    billingAddressId: undefined,
                    shippingAddressId: undefined,
                }),
            );
        });

        it('persists B2B metadata with isInvoice true and the captured form values when the invoiceRedirect capability is enabled', async () => {
            const location = window.location;

            Object.defineProperty(window, 'location', {
                value: {
                    // eslint-disable-next-line @typescript-eslint/no-misused-spread
                    ...location,
                    replace: jest.fn(),
                },
                writable: true,
            });

            B2BSessionStorage.setPaymentValues({ invoicePaymentComment: 'Invoice me' });

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                config: {
                    ...checkoutSettings,
                    storeConfig: {
                        ...checkoutSettings.storeConfig,
                        checkoutSettings: {
                            ...checkoutSettings.storeConfig.checkoutSettings,
                            capabilities: {
                                ...defaultCapabilities,
                                orderConfirmation: {
                                    ...defaultCapabilities.orderConfirmation,
                                    persistB2BMetadata: true,
                                    invoiceRedirect: true,
                                },
                            },
                        },
                    },
                },
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    customer,
                    orderId: 12345,
                },
            });

            jest.spyOn(checkoutService, 'refreshB2BPaymentMethods').mockImplementation(() =>
                Promise.resolve(checkoutService.getState()),
            );
            jest.spyOn(checkoutService, 'finalizeOrderIfNeeded').mockResolvedValue(
                checkoutService.getState(),
            );

            const persistSpy = jest
                .spyOn(checkoutService, 'persistB2BMetadata')
                .mockImplementation(() => Promise.resolve(checkoutService.getState()));

            render(<CheckoutTest {...defaultProps} />);

            await waitFor(() =>
                expect(persistSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        isInvoice: true,
                        invoiceComment: 'Invoice me',
                    }),
                ),
            );
        });

        it('clears B2B sessionStorage even when persisting metadata fails', async () => {
            const location = window.location;

            Object.defineProperty(window, 'location', {
                value: {
                    // eslint-disable-next-line @typescript-eslint/no-misused-spread
                    ...location,
                    replace: jest.fn(),
                },
                writable: true,
            });

            B2BSessionStorage.setAddressIds({ billingAddressId: 111, shippingAddressId: 222 });

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                config: createConfigWithPersistB2BMetadata(),
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    customer,
                    orderId: 12345,
                },
            });

            jest.spyOn(checkoutService, 'refreshB2BPaymentMethods').mockImplementation(() =>
                Promise.resolve(checkoutService.getState()),
            );
            jest.spyOn(checkoutService, 'finalizeOrderIfNeeded').mockResolvedValue(
                checkoutService.getState(),
            );

            const persistSpy = jest
                .spyOn(checkoutService, 'persistB2BMetadata')
                .mockRejectedValue(new Error('Persist failed'));

            render(<CheckoutTest {...defaultProps} />);

            await waitFor(() => expect(persistSpy).toHaveBeenCalled());

            await waitFor(() =>
                expect(B2BSessionStorage.getAddressIds()).toEqual({
                    billingAddressId: undefined,
                    shippingAddressId: undefined,
                }),
            );
        });

        it('does not persist B2B metadata after finalizing the order on mount when persistB2BMetadata capability is disabled', async () => {
            const location = window.location;

            Object.defineProperty(window, 'location', {
                value: {
                    // eslint-disable-next-line @typescript-eslint/no-misused-spread
                    ...location,
                    replace: jest.fn(),
                },
                writable: true,
            });

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling, {
                checkout: {
                    ...checkoutWithShippingAndBilling,
                    customer,
                    orderId: 12345,
                },
            });

            const finalizeSpy = jest
                .spyOn(checkoutService, 'finalizeOrderIfNeeded')
                .mockResolvedValue(checkoutService.getState());
            const persistSpy = jest
                .spyOn(checkoutService, 'persistB2BMetadata')
                .mockImplementation(() => Promise.resolve(checkoutService.getState()));

            render(<CheckoutTest {...defaultProps} />);

            await waitFor(() => expect(finalizeSpy).toHaveBeenCalled());

            expect(persistSpy).not.toHaveBeenCalled();
        });
    });
});
