import {
    BodlEventsPayload,
    BodlService,
    BraintreeAnalyticTrackerService,
    CheckoutService,
    createBodlService,
    createBraintreeAnalyticTracker,
    createPayPalCommerceAnalyticTracker,
    createStepTracker,
    PayPalCommerceAnalyticTrackerService,
    StepTracker,
} from '@bigcommerce/checkout-sdk';
import React, { ReactNode, useMemo } from 'react';

import AnalyticsContext, { AnalyticsEvents } from './AnalyticsContext';
import createAnalyticsService from './createAnalyticsService';

interface AnalyticsProviderProps {
    checkoutService: CheckoutService;
    children: ReactNode;
}

const AnalyticsProvider = ({ checkoutService, children }: AnalyticsProviderProps) => {
    const getStepTracker = useMemo(
        () => createAnalyticsService<StepTracker>(createStepTracker, [checkoutService]),
        [checkoutService],
    );
    const getBodlService = useMemo(
        () => createAnalyticsService<BodlService>(createBodlService, [checkoutService.subscribe]),
        [checkoutService],
    );
    const getBraintreeAnalyticTracker = useMemo(
        () =>
            createAnalyticsService<BraintreeAnalyticTrackerService>(
                createBraintreeAnalyticTracker,
                [checkoutService],
            ),
        [checkoutService],
    );
    const getPayPalCommerceAnalyticTracker = useMemo(
        () =>
            createAnalyticsService<PayPalCommerceAnalyticTrackerService>(
                createPayPalCommerceAnalyticTracker,
                [checkoutService],
            ),
        [checkoutService],
    );

    const checkoutBegin = () => {
        getStepTracker().trackCheckoutStarted();
        getBodlService().checkoutBegin();
    };

    const trackStepCompleted = (currentStep: string) => {
        getStepTracker().trackStepCompleted(currentStep);
        getBodlService().stepCompleted(currentStep);
    };

    const trackStepViewed = (step: string) => {
        getStepTracker().trackStepViewed(step);
    };

    const orderPurchased = () => {
        getStepTracker().trackOrderComplete();
        getBodlService().orderPurchased();
    };

    const customerEmailEntry = (email: string) => {
        getBodlService().customerEmailEntry(email);
    };

    const customerSuggestionInit = (payload: BodlEventsPayload) => {
        getBodlService().customerSuggestionInit(payload);
    };

    const customerSuggestionExecute = () => {
        getBodlService().customerSuggestionExecute();
    };

    const customerPaymentMethodExecuted = (payload: BodlEventsPayload) => {
        getBodlService().customerPaymentMethodExecuted(payload);
        getBraintreeAnalyticTracker().customerPaymentMethodExecuted();
        getPayPalCommerceAnalyticTracker().customerPaymentMethodExecuted();
    };

    const showShippingMethods = () => {
        getBodlService().showShippingMethods();
    };

    const selectedPaymentMethod = (methodName: string, methodId: string) => {
        getBodlService().selectedPaymentMethod(methodName);
        getBraintreeAnalyticTracker().selectedPaymentMethod(methodId);
        getPayPalCommerceAnalyticTracker().selectedPaymentMethod(methodId);
    };

    const clickPayButton = (payload: BodlEventsPayload) => {
        getBodlService().clickPayButton(payload);
    };

    const paymentRejected = () => {
        getBodlService().paymentRejected();
    };

    const paymentComplete = () => {
        getBodlService().paymentComplete();
        getBraintreeAnalyticTracker().paymentComplete();
        getPayPalCommerceAnalyticTracker().paymentComplete();
    };

    const exitCheckout = () => {
        getBodlService().exitCheckout();
    };

    const walletButtonClick = (methodId: string) => {
        getBraintreeAnalyticTracker().walletButtonClick(methodId);
        getPayPalCommerceAnalyticTracker().walletButtonClick(methodId);
    };

    const analyticsTracker: AnalyticsEvents = {
        checkoutBegin,
        trackStepCompleted,
        trackStepViewed,
        orderPurchased,
        customerEmailEntry,
        customerSuggestionInit,
        customerSuggestionExecute,
        customerPaymentMethodExecuted,
        showShippingMethods,
        selectedPaymentMethod,
        clickPayButton,
        paymentRejected,
        paymentComplete,
        exitCheckout,
        walletButtonClick,
    };

    return (
        <AnalyticsContext.Provider value={{ analyticsTracker }}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export default AnalyticsProvider;
