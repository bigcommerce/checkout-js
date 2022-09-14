import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback } from 'react';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';

export interface PaypalExpressPaymentMethodProps extends HostedPaymentMethodProps {
    isEmbedded?: boolean;
}

const PaypalExpressPaymentMethod: FunctionComponent<PaypalExpressPaymentMethodProps> = ({
    initializePayment,
    isEmbedded = false,
    ...rest
}) => {
    const initializePaypalExpressPayment = useCallback(
        (options: PaymentInitializeOptions) =>
            initializePayment({
                ...options,
                paypalexpress: {
                    useRedirectFlow: isEmbedded,
                },
            }),
        [initializePayment, isEmbedded],
    );

    return <HostedPaymentMethod {...rest} initializePayment={initializePaypalExpressPayment} />;
};

export default PaypalExpressPaymentMethod;
