import React, { type ReactNode } from 'react';

import { PaymentFormContext } from './PaymentFormContext';
import { type PaymentFormService } from './PaymentFormServiceType';

interface PaymentFormProviderProps {
    children?: ReactNode;
    paymentForm: PaymentFormService;
}

export const PaymentFormProvider = ({ children, paymentForm }: PaymentFormProviderProps) => {
    return (
        <PaymentFormContext.Provider value={{ paymentForm }}>
            {children}
        </PaymentFormContext.Provider>
    );
};
