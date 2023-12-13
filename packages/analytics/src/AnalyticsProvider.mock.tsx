import React, { ReactElement } from 'react';

import AnalyticsContext, { AnalyticsEvents } from './AnalyticsContext';

interface AnalyticsProviderMockProps {
    children: ReactElement;
    analyticsTracker?: Partial<AnalyticsEvents>;
}

const AnalyticsProviderMock = ({ children, analyticsTracker = {} }: AnalyticsProviderMockProps) => {
    const analyticsTrackerDefault: AnalyticsEvents = {
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

    return (
        <AnalyticsContext.Provider
            value={{ analyticsTracker: { ...analyticsTrackerDefault, ...analyticsTracker } }}
        >
            {children}
        </AnalyticsContext.Provider>
    );
};

export default AnalyticsProviderMock;
