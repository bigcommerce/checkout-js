import React, { type FunctionComponent } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import BigCommercePaymentsPaymentMethodComponent from '../components/BigCommercePaymentsPaymentMethodComponent';

const BigCommercePaymentsPayLaterPaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const { checkoutState } = props;
    const isPaymentDataRequired = checkoutState.data.isPaymentDataRequired();

    if (!isPaymentDataRequired) {
        return null;
    }

    return (
        <BigCommercePaymentsPaymentMethodComponent
            providerOptionsKey="bigcommerce_payments_paylater"
            {...props}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BigCommercePaymentsPayLaterPaymentMethod,
    [{ id: 'bigcommerce_payments_paylater' }],
);
