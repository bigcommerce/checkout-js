import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createCreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/credit-card';
import React, { type FunctionComponent, useCallback } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const BarclaycardPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    method,
    paymentForm,
    ...rest
}) => {
    const initializeBarclaycardPayment = useCallback(
        (options: PaymentInitializeOptions) => {
            return checkoutService.initializePayment({
                ...options,
                integrations: [createCreditCardPaymentStrategy],
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
            initializePayment={initializeBarclaycardPayment}
            method={method}
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BarclaycardPaymentMethod,
    [{ gateway: 'barclaycard' }],
);
