import React, { FunctionComponent } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const BarclaycardPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    method,
    paymentForm,
    ...rest
}) => {
    return (
        <HostedPaymentComponent
            {...rest}
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={checkoutService.initializePayment}
            method={method}
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BarclaycardPaymentMethod,
    [{ gateway: 'barclaycard' }],
);
