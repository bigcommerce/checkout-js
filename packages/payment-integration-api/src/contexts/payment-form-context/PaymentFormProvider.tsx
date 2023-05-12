import React, { ReactNode } from 'react';

import PaymentFormService from '../../PaymentFormService';

import { PaymentFormContext } from './PaymentFormContext';

interface PaymentFormProviderProps {
    children: ReactNode;
    paymentForm: PaymentFormService;
}

export const PaymentFormProvider = ({ children, paymentForm }: PaymentFormProviderProps) => {
    return (
        <PaymentFormContext.Provider value={{ paymentForm }}>
            {children}
        </PaymentFormContext.Provider>
    );
};
