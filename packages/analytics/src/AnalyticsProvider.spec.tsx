import * as CheckoutSdk from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React, { useEffect } from 'react';

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

const AnalyticsProviderChildrenMock = ({
    eventName,
    eventPayload,
}: {
    eventName: string;
    eventPayload?: string | CheckoutSdk.BodlEventsPayload;
}) => {
    const { analyticsTracker } = useAnalytics();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        analyticsTracker[eventName](eventPayload);
    }, [analyticsTracker, eventName, eventPayload]);

    return null;
};

const TestComponent = ({
    eventName,
    eventPayload,
}: {
    eventName: string;
    eventPayload?: string | CheckoutSdk.BodlEventsPayload;
}) => {
    const checkoutService = CheckoutSdk.createCheckoutService();

    return (
        <AnalyticsProvider checkoutService={checkoutService}>
            <AnalyticsProviderChildrenMock eventName={eventName} eventPayload={eventPayload} />
        </AnalyticsProvider>
    );
};

describe('AnalyticsProvider', () => {
    let stepTrackerMock: CheckoutSdk.StepTracker;
    let bodlServiceMock: CheckoutSdk.BodlService;

    beforeEach(() => {
        jest.spyOn(createAnalyticsService, 'default').mockImplementation(
            (createFn, _args) => createFn,
        );

        stepTrackerMock = {
            trackOrderComplete: jest.fn(),
            trackCheckoutStarted: jest.fn(),
            trackStepViewed: jest.fn(),
            trackStepCompleted: jest.fn(),
        };
        jest.spyOn(CheckoutSdk, 'createStepTracker').mockImplementation((_args) => stepTrackerMock);

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
    });

    it('throws an error when useAnalytics hook used without AnalyticsContext', () => {
        let errorMessage = '';

        try {
            mount(<AnalyticsProviderChildrenMock eventName="checkoutBegin" />);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            errorMessage = error.message;
        }

        expect(errorMessage).toBe('useAnalytics must be used within an <AnalyticsProvider>');
        expect(stepTrackerMock.trackCheckoutStarted).not.toHaveBeenCalled();
        expect(bodlServiceMock.checkoutBegin).not.toHaveBeenCalled();
    });

    it('track checkout begin', () => {
        mount(<TestComponent eventName="checkoutBegin" />);

        expect(stepTrackerMock.trackCheckoutStarted).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.checkoutBegin).toHaveBeenCalledTimes(1);
    });

    it('track step completed', () => {
        mount(<TestComponent eventName="trackStepCompleted" eventPayload="stepName" />);

        expect(stepTrackerMock.trackStepCompleted).toHaveBeenCalledTimes(1);
        expect(stepTrackerMock.trackStepCompleted).toHaveBeenCalledWith('stepName');
        expect(bodlServiceMock.stepCompleted).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.stepCompleted).toHaveBeenCalledWith('stepName');
    });

    it('track step viewed', () => {
        mount(<TestComponent eventName="trackStepViewed" eventPayload="stepName" />);

        expect(stepTrackerMock.trackStepViewed).toHaveBeenCalledTimes(1);
        expect(stepTrackerMock.trackStepViewed).toHaveBeenCalledWith('stepName');
    });

    it('track order purchased', () => {
        mount(<TestComponent eventName="orderPurchased" />);

        expect(stepTrackerMock.trackOrderComplete).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.orderPurchased).toHaveBeenCalledTimes(1);
    });

    it('track customer email entry', () => {
        mount(<TestComponent eventName="customerEmailEntry" eventPayload="email@test.com" />);

        expect(bodlServiceMock.customerEmailEntry).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.customerEmailEntry).toHaveBeenCalledWith('email@test.com');
    });

    it('track customer suggestion initialization', () => {
        mount(
            <TestComponent
                eventName="customerSuggestionInit"
                eventPayload={{ data: 'test data' }}
            />,
        );

        expect(bodlServiceMock.customerSuggestionInit).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.customerSuggestionInit).toHaveBeenCalledWith({
            data: 'test data',
        });
    });

    it('track customer suggestion execute', () => {
        mount(<TestComponent eventName="customerSuggestionExecute" />);

        expect(bodlServiceMock.customerSuggestionExecute).toHaveBeenCalledTimes(1);
    });

    it('track customer payment method executed', () => {
        mount(
            <TestComponent
                eventName="customerPaymentMethodExecuted"
                eventPayload={{ data: 'test data' }}
            />,
        );

        expect(bodlServiceMock.customerPaymentMethodExecuted).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.customerPaymentMethodExecuted).toHaveBeenCalledWith({
            data: 'test data',
        });
    });

    it('track show shipping methods', () => {
        mount(<TestComponent eventName="showShippingMethods" />);

        expect(bodlServiceMock.showShippingMethods).toHaveBeenCalledTimes(1);
    });

    it('track selected payment method', () => {
        mount(<TestComponent eventName="selectedPaymentMethod" eventPayload="Credit card" />);

        expect(bodlServiceMock.selectedPaymentMethod).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.selectedPaymentMethod).toHaveBeenCalledWith('Credit card');
    });

    it('track click Pay button', () => {
        mount(<TestComponent eventName="clickPayButton" eventPayload={{ data: 'test data' }} />);

        expect(bodlServiceMock.clickPayButton).toHaveBeenCalledTimes(1);
        expect(bodlServiceMock.clickPayButton).toHaveBeenCalledWith({ data: 'test data' });
    });

    it('track payment rejected', () => {
        mount(<TestComponent eventName="paymentRejected" />);

        expect(bodlServiceMock.paymentRejected).toHaveBeenCalledTimes(1);
    });

    it('track payment complete', () => {
        mount(<TestComponent eventName="paymentComplete" />);

        expect(bodlServiceMock.paymentComplete).toHaveBeenCalledTimes(1);
    });

    it('track exit checkout', () => {
        mount(<TestComponent eventName="exitCheckout" />);

        expect(bodlServiceMock.exitCheckout).toHaveBeenCalledTimes(1);
    });
});
