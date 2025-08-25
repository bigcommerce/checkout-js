import React, { type FunctionComponent } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import PayPalCommercePaymentMethodComponent from '../components/PayPalCommercePaymentMethodComponent';

const PayPalCommerceVenmoPaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const { checkoutState } = props;
    const { isPaymentDataRequired } = checkoutState.data;

    if (!isPaymentDataRequired()) {
        return null;
    }

    return (
        <PayPalCommercePaymentMethodComponent providerOptionsKey="paypalcommercevenmo" {...props} />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PayPalCommerceVenmoPaymentMethod,
    [{ id: 'paypalcommercevenmo' }],
);
