import React, { FunctionComponent } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import PayPalCommercePaymentMethodComponent from './components/PayPalCommercePaymentMethodComponent';

const PayPalCommercePaymentMethod: FunctionComponent<PaymentMethodProps> = props => {
    const isPaymentDataRequired = props.checkoutState.data.isPaymentDataRequired();

    if (!isPaymentDataRequired) {
        return null;
    }

    return <PayPalCommercePaymentMethodComponent
        providerOptionsKey="paypalcommerce"
        {...props}
    />;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PayPalCommercePaymentMethod,
    [{ id: 'paypalcommerce' }],
);
