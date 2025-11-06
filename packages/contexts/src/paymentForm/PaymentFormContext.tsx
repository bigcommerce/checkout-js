import { createContext, useContext } from 'react';

import { type PaymentFormService } from './PaymentFormServiceType';

export interface PaymentFormContextProps {
    paymentForm: PaymentFormService;
}

export const PaymentFormContext = createContext<PaymentFormContextProps | undefined>(undefined);

export function usePaymentFormContext() {
    const context = useContext(PaymentFormContext);

    if (!context) {
        throw new Error('usePaymentFormContext must be used within a PaymentFormContextProvider');
    }

    return context;
}
