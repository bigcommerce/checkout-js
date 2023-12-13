import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createEmbeddedCheckoutMessenger,
    EmbeddedCheckoutMessenger,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React, { FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';

import { AnalyticsContextProps, AnalyticsEvents, AnalyticsProviderMock } from '@bigcommerce/checkout/analytics';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { createErrorLogger } from '../common/error';
import { getStoreConfig } from '../config/config.mock';
import { createEmbeddedCheckoutStylesheet } from '../embeddedCheckout';
import { CreatedCustomer, GuestSignUpForm } from '../guestSignup';
import { LoadingSpinner } from '../ui/loading';

import OrderConfirmation, { OrderConfirmationProps } from './OrderConfirmation';
import { getOrder } from './orders.mock';
import OrderStatus from './OrderStatus';
import OrderSummary from './OrderSummary';
import ThankYouHeader from './ThankYouHeader';
import { LocaleProvider } from '@bigcommerce/checkout/locale';

describe('OrderConfirmation', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: OrderConfirmationProps & AnalyticsContextProps;
    let ComponentTest: FunctionComponent<OrderConfirmationProps & AnalyticsContextProps>;
    let embeddedMessengerMock: EmbeddedCheckoutMessenger;
    let orderConfirmation: ReactWrapper;
    let analyticsTracker: Partial<AnalyticsEvents>;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        analyticsTracker = {
            orderPurchased: jest.fn()
        };
        embeddedMessengerMock = createEmbeddedCheckoutMessenger({
            parentOrigin: getStoreConfig().links.siteLink,
        });

        jest.spyOn(checkoutService, 'loadOrder').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.statuses, 'isLoadingOrder').mockReturnValue(true);

        jest.spyOn(checkoutState.data, 'getOrder').mockReturnValue(getOrder());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        defaultProps = {
            containerId: 'app',
            createAccount: jest.fn(() => Promise.resolve({} as CreatedCustomer)),
            createEmbeddedMessenger: () => embeddedMessengerMock,
            embeddedStylesheet: createEmbeddedCheckoutStylesheet(),
            errorLogger: createErrorLogger(),
            orderId: 105,
            analyticsTracker
        };

        ComponentTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider checkoutService={checkoutService}>
                    <AnalyticsProviderMock>
                        <OrderConfirmation {...props} />
                    </AnalyticsProviderMock>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('calls trackOrderComplete when config is ready', async () => {
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(undefined);

        const component = mount(<ComponentTest {...defaultProps} />);

        component.setProps({ config: {} });
        component.update();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(analyticsTracker.orderPurchased).toHaveBeenCalled();
    });

    it('loads passed order ID', () => {
        orderConfirmation = mount(<ComponentTest {...defaultProps} />);

        expect(orderConfirmation.find(LoadingSpinner).prop('isLoading')).toBeTruthy();
        expect(checkoutService.loadOrder).toHaveBeenCalledWith(105);
    });

    it('posts message to parent of embedded checkout when order is loaded', async () => {
        jest.spyOn(embeddedMessengerMock, 'postFrameLoaded').mockImplementation();

        mount(<ComponentTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(embeddedMessengerMock.postFrameLoaded).toHaveBeenCalledWith({
            contentId: defaultProps.containerId,
        });
    });

    it('attaches additional styles for embedded checkout', async () => {
        const styles = { text: { color: '#000' } };

        jest.spyOn(embeddedMessengerMock, 'receiveStyles').mockImplementation((fn) => fn(styles));

        jest.spyOn(defaultProps.embeddedStylesheet, 'append').mockImplementation();

        mount(<ComponentTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.embeddedStylesheet.append).toHaveBeenCalledWith(styles);
    });

    it('renders confirmation page once loading is finished', async () => {
        jest.spyOn(checkoutState.statuses, 'isLoadingOrder').mockReturnValue(false);

        orderConfirmation = mount(<ComponentTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        act(() => {
            orderConfirmation.update();
        });
        act(() => {
            orderConfirmation.update();
        });

        expect(orderConfirmation.find(LoadingSpinner)).toHaveLength(0);
        expect(orderConfirmation.find('.orderConfirmation')).toHaveLength(1);
        expect(orderConfirmation.find(OrderStatus)).toHaveLength(1);
        expect(orderConfirmation.find(ThankYouHeader)).toHaveLength(1);
        expect(orderConfirmation.find(OrderSummary)).toHaveLength(1);
        expect(orderConfirmation.find(GuestSignUpForm).prop('customerCanBeCreated')).toBeTruthy();
        expect(orderConfirmation.find('[data-test="payment-instructions"]')).toMatchSnapshot();
    });

    it('renders set password form', async () => {
        jest.spyOn(checkoutState.statuses, 'isLoadingOrder').mockReturnValue(false);

        jest.spyOn(checkoutState.data, 'getOrder').mockReturnValue({
            ...getOrder(),
            customerId: 1,
        });

        orderConfirmation = mount(<ComponentTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(orderConfirmation.find(GuestSignUpForm).prop('customerCanBeCreated')).toBeFalsy();
    });

    it('renders continue shopping button', () => {
        jest.spyOn(checkoutState.statuses, 'isLoadingOrder').mockReturnValue(false);

        orderConfirmation = mount(<ComponentTest {...defaultProps} />);

        expect(orderConfirmation.find('.continueButtonContainer form').prop('action')).toEqual(
            getStoreConfig().links.siteLink,
        );
    });
});
