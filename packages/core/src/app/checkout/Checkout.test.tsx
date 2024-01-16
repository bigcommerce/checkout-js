import {
    CheckoutService,
    createCheckoutService,
    createEmbeddedCheckoutMessenger,
    EmbeddedCheckoutMessenger,
} from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    AnalyticsContextProps,
    AnalyticsEvents,
    AnalyticsProviderMock,
} from '@bigcommerce/checkout/analytics';
import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { getLanguageService, LocaleProvider } from '@bigcommerce/checkout/locale';
import { CHECKOUT_ROOT_NODE_ID, CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { CheckoutPageNodeObject } from '@bigcommerce/checkout/test-framework';

import { createErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

import Checkout, { CheckoutProps } from './Checkout';

describe('Checkout', () => {
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
                        <ExtensionProvider checkoutService={checkoutService}>
                            <Checkout {...props} />
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
            checkout.use('CartWithPromotions');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(screen.queryAllByRole('alert')).toHaveLength(2);
            expect(screen.getByText('You are eligible for a discount')).toBeInTheDocument();
            expect(screen.getByText('Get a discount if you order more')).toBeInTheDocument();
        });

        it('renders modal error when theres an error flash message', async () => {
            checkout.use('ErrorFlashMessage');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(screen.getByRole('dialog', { name: 'flash message' })).toBeInTheDocument();
        });

        it('renders modal error when theres an custom error flash message', async () => {
            checkout.use('CustomErrorFlashMessage');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            expect(screen.getByRole('heading', { name: 'custom error title' })).toBeInTheDocument();
            expect(screen.getByRole('dialog', { name: 'flash message' })).toBeInTheDocument();
        });

        it('does not render shipping checkout step if not required', async () => {
            checkout.use('CartWithoutPhysicalItem');

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
            checkout.use('CartWithShippingAddress');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForBillingStep();

            const editButtons = screen.getAllByText(/edit/i);

            await userEvent.click(editButtons[1]);

            await checkout.waitForShippingStep();

            expect(analyticsTracker.trackStepViewed).toHaveBeenCalledWith('shipping');
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

            await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
            await userEvent.click(screen.getByText('Continue'));

            await screen.findByText('test@example.com');

            expect(analyticsTracker.trackStepCompleted).toHaveBeenCalledWith('customer');
        });

        it('navigates to next step when shopper continues as guest', async () => {
            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            await userEvent.type(await screen.findByLabelText('Email'), 'test@example.com');
            await userEvent.click(await screen.findByText('Continue'));

            await screen.findByText('test@example.com');

            expect(screen.getByText('test@example.com')).toBeInTheDocument();
        });

        it('logs unhandled error', async () => {
            checkout.use('UnsupportedProvider');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForCustomerStep();

            const error = new Error('Apple pay is not supported');

            expect(defaultProps.errorLogger.log).toHaveBeenCalledWith(error);
        });
    });

    describe('shipping step', () => {
        it('renders shipping component when shipping step is active', async () => {
            checkout.use('CartWithBillingEmail');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForShippingStep();

            expect(
                screen.getByRole('textbox', {
                    name: /address/i,
                }),
            ).toBeInTheDocument();
            expect(screen.getByText(/shipping method/i)).toBeInTheDocument();
        });

        it('logs unhandled error', async () => {
            const error = new Error();

            jest.spyOn(checkoutService, 'loadShippingAddressFields').mockImplementation(() => {
                throw error;
            });

            checkout.use('CartWithBillingEmail');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForShippingStep();

            expect(defaultProps.errorLogger.log).toHaveBeenCalledWith(error);
        });
    });

    describe('billing step', () => {
        it('renders billing component when billing step is active', async () => {
            checkout.use('CartWithShippingAddress');

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
            checkout.use('CartWithShippingAddress');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForBillingStep();

            expect(screen.getByText(/new south wales,/i)).toBeInTheDocument();
            expect(screen.getByText(/pickup in store/i)).toBeInTheDocument();
        });

        it('logs unhandled error', async () => {
            const error = new Error();

            jest.spyOn(checkoutService, 'loadBillingAddressFields').mockImplementation(() => {
                throw error;
            });

            checkout.use('CartWithShippingAddress');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForBillingStep();

            expect(defaultProps.errorLogger.log).toHaveBeenCalledWith(error);
        });
    });

    describe('payment step', () => {
        it('renders payment component when payment step is active', async () => {
            checkout.use('CartWithShippingAndBilling');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            expect(screen.getByText(/test payment provider/i)).toBeInTheDocument();
            expect(screen.getByText(/pay in store/i)).toBeInTheDocument();
            expect(screen.getByText(/place order/i)).toBeInTheDocument();
        });

        it('logs unhandled error', async () => {
            checkout.use('CartWithShippingAndBilling');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            expect(defaultProps.errorLogger.log).toHaveBeenCalled();
        });
    });
});
