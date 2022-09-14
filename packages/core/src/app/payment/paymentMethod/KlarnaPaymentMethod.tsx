import React, { FunctionComponent, useCallback } from 'react';
import { Omit } from 'utility-types';

import HostedWidgetPaymentMethod, {
    HostedWidgetPaymentMethodProps,
} from './HostedWidgetPaymentMethod';

export type KlarnaPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

const KlarnaPaymentMethod: FunctionComponent<KlarnaPaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => {
    const initializeKlarnaPayment = useCallback(
        (options) =>
            initializePayment({
                ...options,
                klarna: {
                    container: '#paymentWidget',
                },
            }),
        [initializePayment],
    );

    return (
        <HostedWidgetPaymentMethod
            {...rest}
            containerId="paymentWidget"
            initializePayment={initializeKlarnaPayment}
        />
    );
};

export default KlarnaPaymentMethod;
