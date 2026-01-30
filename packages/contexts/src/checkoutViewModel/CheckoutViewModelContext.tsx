import { createContext, useContext } from 'react';

import { type CheckoutViewModel } from './CheckoutViewModelType';

const CheckoutViewModelContext = createContext<CheckoutViewModel | undefined>(undefined);

export function useCheckoutViewModel() {
    const context = useContext(CheckoutViewModelContext);

    if (!context) {
        throw new Error('useCheckoutViewModel must be used within a CheckoutViewModel provider');
    }

    return context;
}

export default CheckoutViewModelContext;
