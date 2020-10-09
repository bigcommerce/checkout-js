import React, { useCallback, useContext, FunctionComponent } from 'react';

import { connectFormik, ConnectFormikProps } from '../../common/form';
import { FormContext } from '../../ui/form';
import PaymentContext from '../PaymentContext';
import { PaymentFormValues } from '../PaymentForm';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type PaypalCommercePaymentMethod = Omit<HostedWidgetPaymentMethodProps, 'containerId'> & ConnectFormikProps<PaymentFormValues>;

const PaypalCommercePaymentMethod: FunctionComponent<PaypalCommercePaymentMethod> = ({
      initializePayment,
      onUnhandledError,
      formik: { submitForm, validateForm, setFieldTouched },
      ...rest
  }) => {
    const paymentContext = useContext(PaymentContext);
    const { setSubmitted } = useContext(FormContext);

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
                paymentContext?.hidePaymentSubmitButton?.(rest.method, true);
            },
            submitForm: () => {
                setSubmitted(true);
                submitForm();
            },
            onValidate: async (resolve: () => void, reject: () => void): Promise<void> => {
                const keysValidation = Object.keys(await validateForm());

                if (keysValidation.length) {
                    setSubmitted(true);
                    keysValidation.forEach(key => setFieldTouched(key));

                    return reject();
                }

                return resolve();
            },
        },
    }), [initializePayment, submitForm, paymentContext, rest.method, validateForm, setSubmitted, setFieldTouched]);

    const onError = (error: Error) => {
        paymentContext?.disableSubmit(rest.method, true);

        onUnhandledError?.(error);
    };

    return <HostedWidgetPaymentMethod
        { ...rest }
        containerId="paymentWidget"
        initializePayment={ initializePayPalCommercePayment }
        onUnhandledError={ onError }
        shouldShow={ false }
    />;
};

export default connectFormik(PaypalCommercePaymentMethod);
