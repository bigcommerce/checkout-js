import React, { FunctionComponent } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import PayPalCommercePaymentMethodComponent from '../components/PayPalCommercePaymentMethodComponent';

const PayPalCommerceCreditPaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const { checkoutState } = props;
    const { isPaymentDataRequired } = checkoutState.data;

    if (!isPaymentDataRequired()) {
        return null;
    }

    return (
        <PayPalCommercePaymentMethodComponent
            providerOptionsKey="paypalcommercecredit"
            {...props}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PayPalCommerceCreditPaymentMethod,
    [{ id: 'paypalcommercecredit' }],
);
