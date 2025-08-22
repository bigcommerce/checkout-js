import { FunctionComponent } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import BraintreeVenmoHostedPaymentMethod from './BraintreeVenmoHostedPaymentMethod';
import React from 'react';

const BraintreeVenmoPaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    return <BraintreeVenmoHostedPaymentMethod {...props} />;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeVenmoPaymentMethod,
    [{ id: 'braintreevenmo' }],
);
