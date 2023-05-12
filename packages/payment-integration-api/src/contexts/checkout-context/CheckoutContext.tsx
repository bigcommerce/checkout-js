import { CheckoutSelectors, CheckoutService } from '@bigcommerce/checkout-sdk';
import { createContext, useContext } from 'react';

export interface CheckoutContextProps {
    checkoutService: CheckoutService;
    checkoutState: CheckoutSelectors;
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
