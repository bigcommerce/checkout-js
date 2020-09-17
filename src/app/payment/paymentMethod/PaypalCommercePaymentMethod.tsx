import React, { useCallback, useContext, FunctionComponent } from 'react';

import { connectFormik, ConnectFormikProps } from '../../common/form';
import PaymentContext from '../PaymentContext';
import { PaymentFormValues } from '../PaymentForm';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type PaypalCommercePaymentMethod = Omit<HostedWidgetPaymentMethodProps, 'containerId'> & ConnectFormikProps<PaymentFormValues>;

const PaypalCommercePaymentMethod: FunctionComponent<PaypalCommercePaymentMethod> = ({
      initializePayment,
      onUnhandledError,
      formik: { submitForm },
      ...rest
  }) => {
    const paymentContext = useContext(PaymentContext);
    const initializePayPalCommercePayment = useCallback(options => initializePayment({
        ...options,
        paypalcommerce: {
            container: '#checkout-payment-continue',
            style: {
                height: 55,
                color: 'black',
                label: 'pay',
            },
            onRenderButton: () => {
                if (paymentContext) {
                    paymentContext.hidePaymentSubmitButton(rest.method, true);
                }
            },
            submitForm,
        },
    }), [initializePayment, submitForm, paymentContext, rest.method]);

    const onError = (error: Error) => {
        if (paymentContext) {
            paymentContext.disableSubmit(rest.method, true);
        }

        onUnhandledError?.(error);
    };

    return <HostedWidgetPaymentMethod
        { ...rest }
        containerId="paymentWidget"
        initializePayment={ initializePayPalCommercePayment }
        onUnhandledError={ onError }
    />;
};

export default connectFormik(PaypalCommercePaymentMethod);
