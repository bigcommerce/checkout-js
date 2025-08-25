import React, { type FunctionComponent } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import BigCommercePaymentsPaymentMethodComponent from '../components/BigCommercePaymentsPaymentMethodComponent';

const BigCommercePaymentsVenmoPaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const isPaymentDataRequired = props.checkoutState.data.isPaymentDataRequired();

    if (!isPaymentDataRequired) {
        return null;
    }

    return (
        <BigCommercePaymentsPaymentMethodComponent
            providerOptionsKey="bigcommerce_payments_venmo"
            {...props}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BigCommercePaymentsVenmoPaymentMethod,
    [{ id: 'bigcommerce_payments_venmo' }],
);
