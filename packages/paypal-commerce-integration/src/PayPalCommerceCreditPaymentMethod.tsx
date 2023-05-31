import React, { FunctionComponent } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent
} from '@bigcommerce/checkout/payment-integration-api';

import PayPalCommercePaymentMethodComponent from './components/PayPalCommercePaymentMethodComponent';

const PayPalCommerceCreditPaymentMethod: FunctionComponent<PaymentMethodProps> = props => {
    return <PayPalCommercePaymentMethodComponent
        providerOptionsKey="paypalcommercecredit"
        {...props}
    />;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PayPalCommerceCreditPaymentMethod,
    [{ id: 'paypalcommercecredit' }],
);
