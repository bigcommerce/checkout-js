import {
    type CheckoutService,
    createCheckoutService,
    createEmbeddedCheckoutMessenger,
    type EmbeddedCheckoutMessenger,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
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
    checkoutWithBillingEmail,
    checkoutWithShippingDiscount,
    consignmentAutomaticDiscount,
    consignmentCouponDiscount,
} from '@bigcommerce/checkout/test-framework';
import { renderWithoutWrapper as render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import { createErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

import Checkout, { type CheckoutProps } from './Checkout';

describe('Checkout', () => {
    let checkout: CheckoutPageNodeObject;
    let CheckoutTest: FunctionComponent<CheckoutProps>;
    let checkoutService: CheckoutService;
    let defaultProps: CheckoutProps & AnalyticsContextProps;
    let embeddedMessengerMock: EmbeddedCheckoutMessenger;
    let analyticsTracker: AnalyticsEvents;

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
            trackStepCompleted: jest.fn(),
            trackStepViewed: jest.fn(),
            orderPurchased: jest.fn(),
            customerEmailEntry: jest.fn(),
            customerSuggestionInit: jest.fn(),
            customerSuggestionExecute: jest.fn(),
            customerPaymentMethodExecuted: jest.fn(),
            showShippingMethods: jest.fn(),
            selectedPaymentMethod: jest.fn(),
            clickPayButton: jest.fn(),
            paymentRejected: jest.fn(),
            paymentComplete: jest.fn(),
            exitCheckout: jest.fn(),
            walletButtonClick: jest.fn(),
        };
        defaultProps = {
            checkoutId: 'x',
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
                        <ExtensionProvider checkoutService={checkoutService} errorLogger={defaultProps.errorLogger}>
                            <ThemeProvider>
                                <Checkout {...props} />
                            </ThemeProvider>
                        </ExtensionProvider>
                    </AnalyticsProviderMock>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    describe('initialization', () => {
        it('posts message to parent of embedded checkout when checkout is loaded', async () => {
            jest.spyOn(embeddedMessengerMock, 'postFrameLoaded').mockImplementation();

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(embeddedMessengerMock.postFrameLoaded).toHaveBeenCalledWith({
                contentId: defaultProps.containerId,
            });
        });

        it('attaches additional styles for embedded checkout', async () => {
            const styles = { text: { color: '#000' } };

            jest.spyOn(embeddedMessengerMock, 'receiveStyles').mockImplementation((fn) =>
                fn(styles),
            );
            jest.spyOn(defaultProps.embeddedStylesheet, 'append').mockImplementation();

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(defaultProps.embeddedStylesheet.append).toHaveBeenCalledWith(styles);
        });

        it('render component with proper id', async () => {
            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            const wrapper = screen.getByTestId('checkout-page-container');

            expect(wrapper).toBeInTheDocument();
        });

        it('renders list of promotion banners', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithPromotions);

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(screen.getAllByTestId('promotion-banner-message')).toHaveLength(2);
            expect(screen.getByText('You are eligible for a discount')).toBeInTheDocument();
            expect(screen.getByText('Get a discount if you order more')).toBeInTheDocument();
        });

        it('renders modal error when theres an error flash message', async () => {
            checkoutService = checkout.use(CheckoutPreset.ErrorFlashMessage);

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(screen.getByRole('dialog', { name: 'flash message' })).toBeInTheDocument();
        });

        it('renders modal error when theres an custom error flash message', async () => {
            checkoutService = checkout.use(CheckoutPreset.CustomErrorFlashMessage);

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(screen.getByRole('heading', { name: 'custom error title' })).toBeInTheDocument();
            expect(screen.getByRole('dialog', { name: 'flash message' })).toBeInTheDocument();
        });

        it('does not render shipping checkout step if not required', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithDigitalCart);

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(screen.queryByRole('heading', { name: /shipping/i })).not.toBeInTheDocument();
        });

        it('tracks checkout started when config is ready', async () => {
            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(analyticsTracker.checkoutBegin).toHaveBeenCalled();
        });

        it('tracks a step viewed when a step is expanded', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShipping);

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForBillingStep();

            const editButtons = screen.getAllByText(/edit/i);

            await userEvent.click(editButtons[1]);

            await checkout.waitForShippingStep();

            expect(analyticsTracker.trackStepViewed).toHaveBeenCalledWith('shipping');
        });
    });

    describe('prerendering analytics', () => {
        let originalPrerendering: boolean | undefined;
        let mockAddEventListener: jest.SpyInstance;

        beforeEach(() => {
            originalPrerendering = (document as any).prerendering;
            mockAddEventListener = jest.spyOn(document, 'addEventListener');
        });

        afterEach(() => {
            (document as any).prerendering = originalPrerendering;
            mockAddEventListener.mockRestore();
        });

        it('calls checkoutBegin immediately when not prerendering', async () => {
            (document as any).prerendering = false;

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(analyticsTracker.checkoutBegin).toHaveBeenCalled();
            expect(mockAddEventListener).not.toHaveBeenCalledWith(
                'prerenderingchange',
                expect.any(Function),
                { once: true }
            );
        });

        it('adds prerenderingchange event listener when prerendering', async () => {
            (document as any).prerendering = true;

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(analyticsTracker.checkoutBegin).not.toHaveBeenCalled();
            expect(mockAddEventListener).toHaveBeenCalledWith(
                'prerenderingchange',
                expect.any(Function),
                { once: true }
            );
        });

        it('calls checkoutBegin when prerenderingchange event fires', async () => {
            (document as any).prerendering = true;

            let eventHandler: () => void;

            mockAddEventListener.mockImplementation((event, handler) => {
                if (event === 'prerenderingchange') {
                    eventHandler = handler;
                }
            });

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(analyticsTracker.checkoutBegin).not.toHaveBeenCalled();

            // Simulate the prerenderingchange event
            act(() => {
                eventHandler();
            });

            expect(analyticsTracker.checkoutBegin).toHaveBeenCalled();
        });
    });

    describe('customer step', () => {
        it('renders guest form when customer step is active', async () => {
            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
        });

        it('calls trackStepComplete when switching steps', async () => {
            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            await act(async () => {
                await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
                await userEvent.click(screen.getByText('Continue'));
            });

            expect(analyticsTracker.trackStepCompleted).toHaveBeenCalledWith('customer');
        });

        it('navigates to next step when shopper continues as guest', async () => {
            render(<CheckoutTest {...defaultProps} />, { legacyRoot: true });

            await checkout.waitForCustomerStep();

            await act(async () => {
                await userEvent.type(await screen.findByLabelText('Email'), 'test@example.com');
                await userEvent.click(await screen.findByText('Continue'));
            });

            await screen.findByText('test@example.com');

            expect(screen.getByText('test@example.com')).toBeInTheDocument();
        });

        it('logs unhandled error', async () => {
            checkoutService = checkout.use(CheckoutPreset.UnsupportedProvider);

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            const error = new Error(
                'Unable to proceed because payment method data is unavailable or not properly configured.',
            );

            expect(defaultProps.errorLogger.log).toHaveBeenCalledWith(error);
        });

        it('renders checkout button container with ApplePay', async () => {
            (window as any).ApplePaySession = {};

            checkoutService = checkout.use(CheckoutPreset.RemoteProviders, {
                checkout: checkoutWithBillingEmail,
            });

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForShippingStep();

            expect(screen.getByText('Check out faster with:')).toBeInTheDocument();
        });
    });

    describe('shipping step', () => {
        it('renders shipping component when shipping step is active', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithBillingEmail);

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForShippingStep();

            expect(
                screen.getByRole('textbox', {
                    name: /address/i,
                }),
            ).toBeInTheDocument();
            expect(screen.getByText(/shipping method/i)).toBeInTheDocument();
        });

        it('renders custom shipping method and locks shipping component', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithCustomShippingAndBilling);

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            expect(screen.getByText('Manual Order Custom Shipping Method')).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
            expect(screen.getByText(/test payment provider/i)).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: /pay in store/i })).toBeInTheDocument();
            expect(screen.getByText(/place order/i)).toBeInTheDocument();
        });

        it('logs unhandled error', async () => {
            const error = new Error();

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithBillingEmail);

            jest.spyOn(checkoutService, 'loadShippingAddressFields').mockImplementation(() => {
                throw error;
            });

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForShippingStep();

            expect(defaultProps.errorLogger.log).toHaveBeenCalledWith(error);
        });
    });

    describe('billing step', () => {
        it('renders billing component when billing step is active', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShipping);

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForBillingStep();

            expect(
                screen.getByRole('textbox', {
                    name: /address/i,
                }),
            ).toBeInTheDocument();
            expect(screen.getByText(/billing address/i)).toBeInTheDocument();
        });

        it('renders shipping component with summary data', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShipping);

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForBillingStep();

            expect(screen.getByText(/111 Testing Rd/i)).toBeInTheDocument();
            expect(screen.getByText(/Cityville/i)).toBeInTheDocument();
            expect(screen.getByText(/pickup in store/i)).toBeInTheDocument();
        });

        it('renders shipping summary with shipping discount', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShipping, {
                checkout: checkoutWithShippingDiscount,
            });

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForBillingStep();

            const shippingOptionsInShippingSummary = screen.getByTestId('static-shipping-option');

            expect(shippingOptionsInShippingSummary).toHaveTextContent('Pickup In Store');
            expect(shippingOptionsInShippingSummary).toHaveTextContent('$3.00');
            expect(shippingOptionsInShippingSummary).toHaveTextContent('$1.00');

            const shippingCostInOrderSummary = screen.getByTestId('cart-shipping');

            expect(shippingCostInOrderSummary).toHaveTextContent('Shipping');
            expect(shippingCostInOrderSummary).toHaveTextContent('$3.00');
            expect(shippingCostInOrderSummary).toHaveTextContent('$1.00');

            const couponDetailInOrderSummary = screen.getByTestId('cart-coupon');

            expect(couponDetailInOrderSummary).toHaveTextContent('TEST-SHIPPING-DISCOUNT-CODE');
            expect(couponDetailInOrderSummary).toHaveTextContent('$3.00');
        });

        it('renders shipping summary with 100% off shipping discount', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShipping, {
                checkout: {
                    ...checkoutWithShippingDiscount,
                    consignments: [{
                        ...checkoutWithShippingDiscount.consignments[0],
                        discounts: [
                            { ...consignmentAutomaticDiscount, amount: 3 }
                        ]
                    }],
                    coupons: [],
                },
            });

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForBillingStep();

            const shippingOptionsInShippingSummary = screen.getByTestId('static-shipping-option');

            expect(shippingOptionsInShippingSummary).toHaveTextContent('Pickup In Store');
            expect(shippingOptionsInShippingSummary).toHaveTextContent('$3.00');
            expect(shippingOptionsInShippingSummary).toHaveTextContent('$0.00');

            const shippingCostInOrderSummary = screen.getByTestId('cart-shipping');

            expect(shippingCostInOrderSummary).toHaveTextContent('Shipping');
            expect(shippingCostInOrderSummary).toHaveTextContent('$3.00');
            expect(shippingCostInOrderSummary).toHaveTextContent('Free');
        });

        it('renders multi-shipping summary with shipping discount', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithMultiShippingCart, {
                checkout: {
                    ...checkoutWithShippingDiscount,
                    shippingCostBeforeDiscount: 6,
                    consignments: [
                        checkoutWithShippingDiscount.consignments[0],
                        {
                            ...checkoutWithShippingDiscount.consignments[0],
                            id: 'consignment-2',
                            discounts: [
                                { ...consignmentAutomaticDiscount, amount: 3 },
                                { ...consignmentCouponDiscount, amount: 1 },
                            ]
                        }
                    ],
                    coupons: [{
                        ...checkoutWithShippingDiscount.coupons[0],
                        discountedAmount: 4,
                    }]
                },
            });

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForBillingStep();

            const shippingOptionsInShippingSummary = screen.getAllByTestId('static-shipping-option');

            expect(shippingOptionsInShippingSummary).toHaveLength(2);
            expect(shippingOptionsInShippingSummary[0]).toHaveTextContent('Pickup In Store');
            expect(shippingOptionsInShippingSummary[0]).toHaveTextContent('$3.00');
            expect(shippingOptionsInShippingSummary[0]).toHaveTextContent('$1.00');

            expect(shippingOptionsInShippingSummary[1]).toHaveTextContent('Pickup In Store');
            expect(shippingOptionsInShippingSummary[1]).toHaveTextContent('$0.00');
            expect(shippingOptionsInShippingSummary[1]).toHaveTextContent('$3.00');

            const shippingCostInOrderSummary = screen.getByTestId('cart-shipping');

            expect(shippingCostInOrderSummary).toHaveTextContent('Shipping');
            expect(shippingCostInOrderSummary).toHaveTextContent('$6.00');
            expect(shippingCostInOrderSummary).toHaveTextContent('$1.00');

            const couponDetailInOrderSummary = screen.getByTestId('cart-coupon');

            expect(couponDetailInOrderSummary).toHaveTextContent('TEST-SHIPPING-DISCOUNT-CODE');
            expect(couponDetailInOrderSummary).toHaveTextContent('$4.00');
        });

        it('logs unhandled error', async () => {
            const error = new Error();

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShipping);

            jest.spyOn(checkoutService, 'loadBillingAddressFields').mockImplementation(() => {
                throw error;
            });

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForBillingStep();

            await waitFor(()=>{
                expect(defaultProps.errorLogger.log).toHaveBeenCalledWith(error);
            });
        });
    });

    describe('payment step', () => {
        it('renders payment component when payment step is active', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            expect(screen.getByText(/test payment provider/i)).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: /pay in store/i })).toBeInTheDocument();
            expect(screen.getByText(/place order/i)).toBeInTheDocument();
        });

        it('logs unhandled error', async () => {
            const error = new Error();

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

            jest.spyOn(checkoutService, 'loadPaymentMethods').mockImplementation(() => {
                throw error;
            });

            render(<CheckoutTest {...defaultProps} />, { legacyRoot: true });

            await waitFor(() => {
                expect(defaultProps.errorLogger.log).toHaveBeenCalledWith(error);
            });
        });
    });
});
