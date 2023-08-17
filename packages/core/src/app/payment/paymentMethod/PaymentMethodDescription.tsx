import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import React from 'react';

import BraintreePaypalCreditDescription from './BraintreePaypalCreditDescription';

import { PaymentMethodId } from './index';

interface PaymentMethodDescriptionProps {
    method: PaymentMethod,
    onUnhandledError?(error: Error): void;
}

const PaymentMethodDescription = ({ method, onUnhandledError }: PaymentMethodDescriptionProps) => {
    switch (method.id) {
        case PaymentMethodId.BraintreePaypalCredit:
            return <BraintreePaypalCreditDescription onUnhandledError={onUnhandledError} />

        default:
            return null;
    }
}

export default PaymentMethodDescription;
