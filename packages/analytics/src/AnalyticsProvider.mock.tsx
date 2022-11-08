import React, { FunctionComponent } from 'react';

import AnalyticsContext, { AnalyticsEvents } from './AnalyticsContext';

const AnalyticsProviderMock: FunctionComponent = ({ children }) => {
    const analyticsTracker: AnalyticsEvents = {
        checkoutBegin: jest.fn(),
        trackStepCompleted: jest.fn(),
        trackStepViewed: jest.fn(),
        orderPurchased: jest.fn(),
        customerEmailEntry: jest.fn(),
        customerSuggestionExecute: jest.fn(),
        customerPaymentMethodExecuted: jest.fn(),
        showShippingMethods: jest.fn(),
        selectedPaymentMethod: jest.fn(),
        clickPayButton: jest.fn(),
        paymentRejected: jest.fn(),
        paymentComplete: jest.fn(),
        exitCheckout: jest.fn(),
    };

    return (
        <AnalyticsContext.Provider value={{ analyticsTracker }}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export default AnalyticsProviderMock;
