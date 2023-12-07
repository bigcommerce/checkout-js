import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

export interface PaypalExpressPaymentMethodProps {
    isEmbedded?: boolean;
}

const PaypalExpressPaymentMethod: FunctionComponent<
    PaymentMethodProps & PaypalExpressPaymentMethodProps
> = ({ checkoutService, isEmbedded = false, ...rest }) => {
    const initializePaypalExpressPayment = useCallback(
        (options: PaymentInitializeOptions) =>
            checkoutService.initializePayment({
                ...options,
                paypalexpress: {
                    useRedirectFlow: isEmbedded,
                },
            }),
        [checkoutService, isEmbedded],
    );

    return (
        <HostedPaymentComponent
            {...rest}
            checkoutService={checkoutService}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={initializePaypalExpressPayment}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PaypalExpressPaymentMethod,
    [{ id: 'paypalexpress' }],
);
