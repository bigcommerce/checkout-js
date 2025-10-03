import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createClearpayPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/clearpay';
import React, { type FunctionComponent, useCallback } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const ClearpayPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    method,
    paymentForm,
    ...rest
}) => {
    const initializeClearpayPayment = useCallback(
        (options: PaymentInitializeOptions) => {
            return checkoutService.initializePayment({
                ...options,
                integrations: [createClearpayPaymentStrategy],
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
            initializePayment={initializeClearpayPayment}
            method={method}
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    ClearpayPaymentMethod,
    [{ gateway: 'clearpay' }],
);
