import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback } from 'react';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';
import { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

const BoltClientPaymentMethod: FunctionComponent<HostedPaymentMethodProps> = ({
    initializePayment,
    method,
    ...rest
}) => {
    const initializeBoltPayment: HostedWidgetPaymentMethodProps['initializePayment'] = useCallback(
        (options: PaymentInitializeOptions) =>
            initializePayment({
                ...options,
                bolt: {
                    useBigCommerceCheckout: true,
                },
            }),
        [initializePayment],
    );

    return (
        <HostedPaymentMethod {...rest} initializePayment={initializeBoltPayment} method={method} />
    );
};

export default BoltClientPaymentMethod;
