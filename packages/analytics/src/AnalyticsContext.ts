import { CheckoutPaymentMethodExecutedOptions } from '@bigcommerce/checkout-sdk';
import { createContext } from 'react';

export interface AnalyticsEvents {
    checkoutBegin(): void;
    trackStepCompleted(step: string): void;
    trackStepViewed(step: string): void;
    orderPurchased(): void;
    customerEmailEntry(email: string): void;
    customerSuggestionExecute(): void;
    customerPaymentMethodExecuted(payload?: CheckoutPaymentMethodExecutedOptions): void;
    showShippingMethods(): void;
    selectedPaymentMethod(methodName?: string): void;
    clickPayButton(payload?: { [key: string]: unknown }): void;
    paymentRejected(): void;
    paymentComplete(): void;
    exitCheckout(): void;
}

export interface AnalyticsContextProps {
    analyticsTracker: AnalyticsEvents;
}

const AnalyticsContext = createContext<AnalyticsContextProps | undefined>(undefined);

export default AnalyticsContext;
