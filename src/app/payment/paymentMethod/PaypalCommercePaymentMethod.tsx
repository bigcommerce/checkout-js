import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type PaypalCommercePaymentMethod = Omit<HostedWidgetPaymentMethodProps, 'containerId' | 'disableSubmitButton'>;

const PaypalCommercePaymentMethod: FunctionComponent<PaypalCommercePaymentMethod> = ({
                                                                              initializePayment,
                                                                              ...rest
                                                                          }) => {
    const initializePayPalComemrcePayment = useCallback(options => initializePayment({
        ...options,
        paypalcommerce: {
            container: '#paymentWidget',
        },
    }), [initializePayment]);

    return <HostedWidgetPaymentMethod
        { ...rest }
        containerId="paymentWidget"
        disableSubmitButton={ true }
        initializePayment={ initializePayPalComemrcePayment }
    />;
};

export default PaypalCommercePaymentMethod;
