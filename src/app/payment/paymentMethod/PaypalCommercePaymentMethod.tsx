import React, { useCallback, useContext, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import PaymentContext from '../PaymentContext';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';
// import {WithPaymentProps} from "../withPayment";

export type PaypalCommercePaymentMethod = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

const PaypalCommercePaymentMethod: FunctionComponent<PaypalCommercePaymentMethod> = ({
      initializePayment,
      onUnhandledError,
      hidePaymentButton,
      submitForm,
      // disableSubmit,
      ...rest
  }) => {
    const paymentContext = useContext(PaymentContext);
    const initializePayPalCommercePayment = useCallback(options => initializePayment({
        ...options,
        paypalcommerce: {
            container: '#paymentButtonWidget', // TODO add container for hosted submit button
            style: {
                height: 55,
                color: 'black',
                label: 'pay',
            },
            hidePaymentButton,
            submitForm,
            onError: () => {
                if (paymentContext) {
                    paymentContext.disableSubmit(rest.method, true);
                }
            },
        },
    }), [initializePayment, submitForm, hidePaymentButton, paymentContext, rest.method]);

    return <HostedWidgetPaymentMethod
        { ...rest }
        containerId="paymentWidget"
        initializePayment={ initializePayPalCommercePayment }
    />;
};

export default PaypalCommercePaymentMethod;
