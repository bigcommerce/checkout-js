import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createBlueSnapDirectAPMPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/bluesnap-direct';
import React, { type FunctionComponent, useCallback } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const BlueSnapDirectAlternativePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    ...rest
}) => {
    const initializeBlueSnapDirectPayment = useCallback(
        (options: PaymentInitializeOptions) => {
            return checkoutService.initializePayment({
                ...options,
                integrations: [createBlueSnapDirectAPMPaymentStrategy],
            });
        },
        [checkoutService],
    );

    return (
        <HostedPaymentComponent
            {...rest}
            checkoutService={checkoutService}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={initializeBlueSnapDirectPayment}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BlueSnapDirectAlternativePaymentMethod,
    [{ gateway: 'bluesnapdirect' }],
);
