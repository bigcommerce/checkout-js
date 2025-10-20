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

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import {
    type AnalyticsContextProps,
    type AnalyticsEvents,
    AnalyticsProviderMock,
 ThemeProvider } from '@bigcommerce/checkout/contexts';
import { getLanguageService, LocaleProvider } from '@bigcommerce/checkout/locale';
import {
    CHECKOUT_ROOT_NODE_ID,
    CheckoutProvider,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    CheckoutPageNodeObject,
    CheckoutPreset,
    checkoutWithBillingEmail, checkoutWithShippingAndBilling, customer,
    orderResponse,
    payments,
} from '@bigcommerce/checkout/test-framework';
import { renderWithoutWrapper as render, screen } from '@bigcommerce/checkout/test-utils';

import Checkout, { type CheckoutProps } from '../checkout/Checkout';
import { createErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

describe('Payment step', () => {
    let checkout: CheckoutPageNodeObject;
    let CheckoutTest: FunctionComponent<CheckoutProps>;
    let checkoutService: CheckoutService;
    let defaultProps: CheckoutProps & AnalyticsContextProps;
    let embeddedMessengerMock: EmbeddedCheckoutMessenger;
    let analyticsTracker: Partial<AnalyticsEvents>;

    beforeAll(() => {
        checkout = new CheckoutPageNodeObject();
        checkout.goto();
    });

    afterEach(() => {
        checkout.resetHandlers();
    });

    afterAll(() => {
        checkout.close();
    });

    beforeEach(() => {
        window.scrollTo = jest.fn();

        checkoutService = createCheckoutService();
        embeddedMessengerMock = createEmbeddedCheckoutMessenger({
            parentOrigin: 'https://store.url',
        });
        analyticsTracker = {
            checkoutBegin: jest.fn(),
            trackStepViewed: jest.fn(),
            trackStepCompleted: jest.fn(),
            exitCheckout: jest.fn(),
        };
        defaultProps = {
            checkoutId: checkoutWithBillingEmail.id,
            containerId: CHECKOUT_ROOT_NODE_ID,
            createEmbeddedMessenger: () => embeddedMessengerMock,
            embeddedStylesheet: createEmbeddedCheckoutStylesheet(),
            embeddedSupport: createEmbeddedCheckoutSupport(getLanguageService()),
            errorLogger: createErrorLogger(),
            analyticsTracker,
        };

        jest.spyOn(defaultProps.errorLogger, 'log').mockImplementation(noop);

        CheckoutTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider checkoutService={checkoutService}>
                    <AnalyticsProviderMock>
                        <ExtensionProvider
                            checkoutService={checkoutService}
                            errorLogger={{
                                log: jest.fn(),
                            }}
                        >
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

    it('selects another payment method and places the order successfully', async () => {
        checkout.setRequestHandler(rest.post(
            '/internalapi/v1/checkout/order',
            (_, res, ctx) => res(
                ctx.json(orderResponse),
            )));
        checkout.setRequestHandler(rest.get(
            '/api/storefront/orders/*',
            (_, res, ctx) => res(
                ctx.json(orderResponse),
            )));

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

        expect(screen.getByRole('radio', { name: 'Pay in Store', checked: true })).toBeInTheDocument();

        await act(async () => userEvent.click(screen.getByRole('radio', { name: 'Cash on Delivery' })));

        expect(await screen.findByRole('radio', { name: 'Cash on Delivery', checked: true })).toBeInTheDocument();

        await act(async () => userEvent.click(screen.getByText('Place Order')));

        expect(window.location.replace).toHaveBeenCalledWith('/order-confirmation');
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

        checkout.setRequestHandler(rest.post(
            'api/storefront/checkouts/*/store-credit',
            (_, res, ctx) => res(
                ctx.json({
                    ...checkoutWithShippingAndBilling,
                    isStoreCreditApplied: true,
                    outstandingBalance: 0,
                    customer: {
                        ...customer,
                        storeCredit: 1000,
                    },
                })
            )));

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByText(/Payment is not required/)).toBeInTheDocument();
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

        checkout.setRequestHandler(rest.get(
            '/api/storefront/payments',
            (_, res, ctx) => res(
                ctx.json([payments[0], amazonPay])
            )));

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

        checkout.setRequestHandler(rest.get(
            '/api/storefront/payments',
            (_, res, ctx) => res(
                ctx.json([payments[0], bolt])
            )));

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByRole('radio')).toBeInTheDocument();
        expect(screen.queryByText('Bolt')).not.toBeInTheDocument();
    });

    it('does not render methods with braintreelocalmethods id', async () => {
        const braintree = {
            ...payments[0],
            id: 'braintreelocalmethods',config: {
                ...payments[0].config,
                displayName: 'BrainTree Local Methods',
            },
        };

        checkout.setRequestHandler(rest.get(
            '/api/storefront/payments',
            (_, res, ctx) => res(
                ctx.json([payments[0], braintree])
            )));

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByRole('radio')).toBeInTheDocument();
        expect(screen.queryByText(/BrainTree/)).not.toBeInTheDocument();
    });

    it('does not render payment form if there are no methods', async () => {
        checkout.setRequestHandler(rest.get(
            '/api/storefront/payments',
            (_, res, ctx) => res(
                ctx.json([])
            )));

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        expect(await screen.findByText('Payment')).toBeInTheDocument();
        expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });

    it('renders error modal if there is error when submitting order', async () => {
        checkout.setRequestHandler(rest.post(
            '/internalapi/v1/checkout/order',
            (_, res, ctx) => res(
                ctx.status(500),
                ctx.json({
                    title: 'The tax provider is unavailable.',
                    type: 'order_error',
                }),
            )));

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();
        await userEvent.click(screen.getByText('Place Order'));

        expect(screen.getByText('Something\'s gone wrong')).toBeInTheDocument();

        await userEvent.click(screen.getByText('Ok'));

        expect(screen.queryByText('Something\'s gone wrong')).not.toBeInTheDocument();
    });
});
