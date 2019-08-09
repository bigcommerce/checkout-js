import React, { FunctionComponent } from 'react';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';

export interface PaypalExpressPaymentMethodProps extends HostedPaymentMethodProps {
    isEmbedded?: boolean;
}

const PaypalExpressPaymentMethod: FunctionComponent<PaypalExpressPaymentMethodProps> = ({
    initializePayment,
    isEmbedded = false,
    ...rest
}) => (
    <HostedPaymentMethod
        { ...rest }
        initializePayment={ options => initializePayment({
            ...options,
            paypalexpress: {
                useRedirectFlow: isEmbedded,
            },
        }) }
    />
);

export default PaypalExpressPaymentMethod;
