import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type MonerisPaymentMethodProps = Omit< HostedWidgetPaymentMethodProps, 'containerId'>;

const MonerisPaymentMethod: FunctionComponent<MonerisPaymentMethodProps> = ({
    initializePayment,
    ...rest
  }) => {

    const containerId = `moneris-iframe-container`;

    const initializeMonerisPayment = useCallback((options: PaymentInitializeOptions) => initializePayment({
        ...options,
        moneris: {
            containerId,
        },
    }), [containerId, initializePayment]);

    return <HostedWidgetPaymentMethod
        { ...rest }
        containerId={ containerId }
        initializePayment={ initializeMonerisPayment }
    />;
};

export default MonerisPaymentMethod;
