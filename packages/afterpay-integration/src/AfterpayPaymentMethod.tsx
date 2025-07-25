import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createAfterpayPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations';
import React, { FunctionComponent, useCallback } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const AfterpayPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    method,
    paymentForm,
    ...rest
}) => {
    const initializeAfterpayPayment = useCallback(
        (options: PaymentInitializeOptions) => {
            return checkoutService.initializePayment({
                ...options,
                integrations: [createAfterpayPaymentStrategy],
            });
        },
        [checkoutService],
    );

    return (
        <HostedPaymentComponent
            {...rest}
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={initializeAfterpayPayment}
            method={method}
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    AfterpayPaymentMethod,
    [{ gateway: 'afterpay' }],
);
