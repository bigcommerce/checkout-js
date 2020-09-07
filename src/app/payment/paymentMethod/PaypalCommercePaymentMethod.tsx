import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type PaypalCommercePaymentMethod = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

const PaypalCommercePaymentMethod: FunctionComponent<PaypalCommercePaymentMethod> = ({
      initializePayment,
      submitForm,
      ...rest
  }) => {
    const initializePayPalComemrcePayment = useCallback(options => initializePayment({
        ...options,
        paypalcommerce: {
            container: '#embeddedSubmitButtonContainer', // TODO add container for hosted submit button
            submitForm,
        },
    }), [initializePayment, submitForm]);

    return <HostedWidgetPaymentMethod
        { ...rest }
        containerId="paymentWidget"
        initializePayment={ initializePayPalComemrcePayment }
    />;
};

export default PaypalCommercePaymentMethod;
