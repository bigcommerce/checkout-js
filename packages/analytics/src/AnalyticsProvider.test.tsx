import * as CheckoutSdk from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import React, { useEffect } from 'react';

import { isErrorWithMessage } from '@bigcommerce/checkout/error-handling-utils';

import AnalyticsProvider from './AnalyticsProvider';
import * as createAnalyticsService from './createAnalyticsService';
import useAnalytics from './useAnalytics';

jest.mock('@bigcommerce/checkout-sdk', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        ...jest.requireActual('@bigcommerce/checkout-sdk'),
    };
});

type EventPropsItem = string | CheckoutSdk.BodlEventsPayload;

const AnalyticsProviderChildrenMock = ({
    eventName,
    eventProps = [],
}: {
    eventName: string;
    eventProps?: EventPropsItem[];
}) => {
    const { analyticsTracker } = useAnalytics();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        analyticsTracker[eventName](...eventProps);
    }, [analyticsTracker, eventName, eventProps]);

    return null;
};

const TestComponent = ({
    eventName,
    eventProps,
}: {
    eventName: string;
    eventProps?: EventPropsItem[];
}) => {
    const checkoutService = CheckoutSdk.createCheckoutService();

    return (
        <AnalyticsProvider checkoutService={checkoutService}>
            <AnalyticsProviderChildrenMock eventName={eventName} eventProps={eventProps} />
        </AnalyticsProvider>
    );
};

describe('AnalyticsProvider', () => {
    let stepTrackerMock: CheckoutSdk.StepTracker;
    let bodlServiceMock: CheckoutSdk.BodlService;
    let braintreeAnalyticTracker: CheckoutSdk.BraintreeAnalyticTrackerService;
    let paypalCommerceAnalyticTracker: CheckoutSdk.PayPalCommerceAnalyticTrackerService;

    beforeEach(() => {
        jest.spyOn(createAnalyticsService, 'default').mockImplementation((createFn) => createFn);

        stepTrackerMock = {
            trackOrderComplete: jest.fn(),
            trackCheckoutStarted: jest.fn(),
            trackStepViewed: jest.fn(),
            trackStepCompleted: jest.fn(),
        };
        jest.spyOn(CheckoutSdk, 'createStepTracker').mockImplementation(() => stepTrackerMock);

        bodlServiceMock = {
            checkoutBegin: jest.fn(),
            orderPurchased: jest.fn(),
            stepCompleted: jest.fn(),
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
        };
        jest.spyOn(CheckoutSdk, 'createBodlService').mockImplementation(() => bodlServiceMock);

        braintreeAnalyticTracker = {
            customerPaymentMethodExecuted: jest.fn(),
            selectedPaymentMethod: jest.fn(),
            paymentComplete: jest.fn(),
            walletButtonClick: jest.fn(),
        };
        jest.spyOn(CheckoutSdk, 'createBraintreeAnalyticTracker').mockImplementation(
            () => braintreeAnalyticTracker,
        );

        paypalCommerceAnalyticTracker = {
            customerPaymentMethodExecuted: jest.fn(),
            selectedPaymentMethod: jest.fn(),
            paymentComplete: jest.fn(),
            walletButtonClick: jest.fn(),
        };
        jest.spyOn(CheckoutSdk, 'createPayPalCommerceAnalyticTracker').mockImplementation(
            () => paypalCommerceAnalyticTracker,
        );
    });

    it('throws an error when useAnalytics hook used without AnalyticsContext', () => {
        let errorMessage = '';

        try {
            render(<AnalyticsProviderChildrenMock eventName="checkoutBegin" />);
        } catch (error: unknown) {
            if (isErrorWithMessage(error)) {
                errorMessage = error.message;
            }
        }

        expect(errorMessage).toBe('useAnalytics must be used within an <AnalyticsProvider>');
        expect(stepTrackerMock.trackCheckoutStarted).not.toHaveBeenCalled();
        expect(bodlServiceMock.checkoutBegin).not.toHaveBeenCalled();
    });

    it('track checkout begin', () => {
        render(<TestComponent eventName="checkoutBegin" />);

        expect(stepTrackerMock.trackCheckoutStarted).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.checkoutBegin).toHaveBeenCalledTimes(1);
    });

    it('track step completed', () => {
        render(<TestComponent eventName="trackStepCompleted" eventProps={['stepName']} />);

        expect(stepTrackerMock.trackStepCompleted).toHaveBeenCalledTimes(1);
        expect(stepTrackerMock.trackStepCompleted).toHaveBeenCalledWith('stepName');
        expect(bodlServiceMock.stepCompleted).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.stepCompleted).toHaveBeenCalledWith('stepName');
    });

    it('track step viewed', () => {
        render(<TestComponent eventName="trackStepViewed" eventProps={['stepName']} />);

        expect(stepTrackerMock.trackStepViewed).toHaveBeenCalledTimes(1);
        expect(stepTrackerMock.trackStepViewed).toHaveBeenCalledWith('stepName');
    });

    it('track order purchased', () => {
        render(<TestComponent eventName="orderPurchased" />);

        expect(stepTrackerMock.trackOrderComplete).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.orderPurchased).toHaveBeenCalledTimes(1);
    });

    it('track customer email entry', () => {
        render(<TestComponent eventName="customerEmailEntry" eventProps={['email@test.com']} />);

        expect(bodlServiceMock.customerEmailEntry).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.customerEmailEntry).toHaveBeenCalledWith('email@test.com');
    });

    it('track customer suggestion initialization', () => {
        render(
            <TestComponent
                eventName="customerSuggestionInit"
                eventProps={[{ data: 'test data' }]}
            />,
        );

        expect(bodlServiceMock.customerSuggestionInit).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.customerSuggestionInit).toHaveBeenCalledWith({
            data: 'test data',
        });
    });

    it('track customer suggestion execute', () => {
        render(<TestComponent eventName="customerSuggestionExecute" />);

        expect(bodlServiceMock.customerSuggestionExecute).toHaveBeenCalledTimes(1);
    });

    it('track customer payment method executed', () => {
        render(
            <TestComponent
                eventName="customerPaymentMethodExecuted"
                eventProps={[{ data: 'test data' }]}
            />,
        );

        expect(bodlServiceMock.customerPaymentMethodExecuted).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.customerPaymentMethodExecuted).toHaveBeenCalledWith({
            data: 'test data',
        });
        expect(braintreeAnalyticTracker.customerPaymentMethodExecuted).toHaveBeenCalledTimes(1);
        expect(braintreeAnalyticTracker.customerPaymentMethodExecuted).toHaveBeenCalled();
        expect(paypalCommerceAnalyticTracker.customerPaymentMethodExecuted).toHaveBeenCalledTimes(
            1,
        );
        expect(paypalCommerceAnalyticTracker.customerPaymentMethodExecuted).toHaveBeenCalled();
    });

    it('track show shipping methods', () => {
        render(<TestComponent eventName="showShippingMethods" />);

        expect(bodlServiceMock.showShippingMethods).toHaveBeenCalledTimes(1);
    });

    it('track selected payment method', () => {
        render(
            <TestComponent
                eventName="selectedPaymentMethod"
                eventProps={['Credit card', 'paypalcreditcard']}
            />,
        );

        expect(bodlServiceMock.selectedPaymentMethod).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.selectedPaymentMethod).toHaveBeenCalledWith('Credit card');
        expect(braintreeAnalyticTracker.selectedPaymentMethod).toHaveBeenCalledTimes(1);
        expect(braintreeAnalyticTracker.selectedPaymentMethod).toHaveBeenCalledWith(
            'paypalcreditcard',
        );
        expect(paypalCommerceAnalyticTracker.selectedPaymentMethod).toHaveBeenCalledTimes(1);
        expect(paypalCommerceAnalyticTracker.selectedPaymentMethod).toHaveBeenCalledWith(
            'paypalcreditcard',
        );
    });

    it('track wallet button click', () => {
        render(<TestComponent eventName="walletButtonClick" eventProps={['paypalwalletbutton']} />);

        expect(braintreeAnalyticTracker.walletButtonClick).toHaveBeenCalledTimes(1);
        expect(braintreeAnalyticTracker.walletButtonClick).toHaveBeenCalledWith(
            'paypalwalletbutton',
        );
        expect(paypalCommerceAnalyticTracker.walletButtonClick).toHaveBeenCalledTimes(1);
        expect(paypalCommerceAnalyticTracker.walletButtonClick).toHaveBeenCalledWith(
            'paypalwalletbutton',
        );
    });

    it('track click Pay button', () => {
        render(<TestComponent eventName="clickPayButton" eventProps={[{ data: 'test data' }]} />);

        expect(bodlServiceMock.clickPayButton).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.clickPayButton).toHaveBeenCalledWith({ data: 'test data' });
    });

    it('track payment rejected', () => {
        render(<TestComponent eventName="paymentRejected" />);

        expect(bodlServiceMock.paymentRejected).toHaveBeenCalledTimes(1);
    });

    it('track payment complete', () => {
        render(<TestComponent eventName="paymentComplete" />);

        expect(bodlServiceMock.paymentComplete).toHaveBeenCalledTimes(1);
    });

    it('track exit checkout', () => {
        render(<TestComponent eventName="exitCheckout" />);

        expect(bodlServiceMock.exitCheckout).toHaveBeenCalledTimes(1);
    });
});
