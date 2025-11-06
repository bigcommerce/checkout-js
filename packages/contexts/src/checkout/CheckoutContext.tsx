import { type CheckoutSelectors, type CheckoutService } from '@bigcommerce/checkout-sdk';
import { createContext, useContext } from 'react';

import type ErrorLogger from './ErrorLogger';

export interface CheckoutContextProps {
    checkoutService: CheckoutService;
    checkoutState: CheckoutSelectors;
    errorLogger?: ErrorLogger;
}

const CheckoutContext = createContext<CheckoutContextProps | undefined>(undefined);

export function useCheckout() {
    const context = useContext(CheckoutContext);

    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutContextProvider');
    }

    return context;
}

export default CheckoutContext;
