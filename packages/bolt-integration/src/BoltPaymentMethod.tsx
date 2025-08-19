import React, { type FunctionComponent } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import BoltClientPaymentMethod from './BoltClientPaymentMethod';
import BoltEmbeddedPaymentMethod from './BoltEmbeddedPaymentMethod';

const BoltPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    method,
    paymentForm,
    ...rest
}) => {
    const useBoltEmbedded = method.initializationData?.embeddedOneClickEnabled;

    if (useBoltEmbedded) {
        return (
            <BoltEmbeddedPaymentMethod
                checkoutService={checkoutService}
                checkoutState={checkoutState}
                method={method}
                paymentForm={paymentForm}
                {...rest}
            />
        );
    }

    return (
        <BoltClientPaymentMethod
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            method={method}
            paymentForm={paymentForm}
            {...rest}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BoltPaymentMethod,
    [{ id: 'bolt' }],
);
