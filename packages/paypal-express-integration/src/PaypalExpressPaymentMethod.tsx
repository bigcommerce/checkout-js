import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createPaypalExpressPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/paypal-express';
import React, { type FunctionComponent, useCallback } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
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
                integrations: [createPaypalExpressPaymentStrategy],
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
