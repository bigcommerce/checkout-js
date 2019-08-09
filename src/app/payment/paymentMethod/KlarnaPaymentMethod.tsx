import React, { FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type KlarnaPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

const KlarnaPaymentMethod: FunctionComponent<KlarnaPaymentMethodProps> = ({
    initializePayment,
    onUnhandledError,
    ...rest
}) => (
    <HostedWidgetPaymentMethod
        { ...rest }
        containerId="paymentWidget"
        initializePayment={ options => initializePayment({
            ...options,
            klarna: {
                container: '#paymentWidget',
            },
        }) }
    />
);

export default KlarnaPaymentMethod;
