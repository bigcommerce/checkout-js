import { createContext, useContext } from 'react';

import PaymentMethodProps from '../../PaymentMethodProps';

export type PaymentFormContextProps = Pick<PaymentMethodProps, 'paymentForm'>;

export const PaymentFormContext = createContext<PaymentFormContextProps | undefined>(undefined);

export function usePaymentFormContext() {
    const context = useContext(PaymentFormContext);

    if (!context) {
        throw new Error('usePaymentFormContext must be used within a PaymentFormContextProvider');
    }

    return context;
}
