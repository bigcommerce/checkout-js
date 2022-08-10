import { PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import React, { useCallback, useContext, FunctionComponent } from 'react';

import { connectFormik, ConnectFormikProps } from '../../common/form';
import { FormContext } from '../../ui/form';
import PaymentContext from '../PaymentContext';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

interface AdditionalProps {
    uniqueId: string;
    isAPM: boolean;
}

export type PaypalCommercePaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'> & ConnectFormikProps<PaymentFormValues> & AdditionalProps;

const PaypalCommercePaymentMethod: FunctionComponent<PaypalCommercePaymentMethodProps> = ({
      initializePayment,
      onUnhandledError,
      formik: { submitForm, validateForm, setFieldTouched },
      uniqueId,
      isAPM,
      ...rest
  }) => {
    const paymentContext = useContext(PaymentContext);
    const { setSubmitted } = useContext(FormContext);
    const paymentUniqueId = `${uniqueId}-paymentWidget`;
    const paymentMethodsWithoutWidget = ['venmo'];
    const { method: { id } } = rest;

    const shouldShowWidget = isAPM && !paymentMethodsWithoutWidget.includes(id);

    const initializePayPalCommercePayment = useCallback(options => initializePayment({
        ...options,
        paypalcommerce: {
            container: '#checkout-payment-continue',
            apmFieldsContainer: `#${paymentUniqueId}`,
            apmFieldsStyles: {
                variables: {
                    fontFamily: 'Open Sans, Helvetica Neue, Arial, sans-serif',
                    colorBackground: 'transparent',
                    textColor: 'black',
                    fontSizeBase: '16px',
                    spacingUnit: '1rem',
                    borderColor: '#d9d9d9',
                    borderRadius: '4px',
                    borderWidth: '1px',
                },
                rules: {
                    '.Input': {
                        backgroundColor: 'white',
                        color: '#333',
                        fontSize: '1rem',
                    },
                    '.Input:active': {
                        color: '#4496f6',
                    },
                    '.Input--invalid': {
                        color: '#ed6a6a',
                    },
                },
            },
            onRenderButton: () => {
                paymentContext?.hidePaymentSubmitButton?.(rest.method, true);
            },
            submitForm: () => {
                setSubmitted(true);
                submitForm();
            },
            onError: (error: Error) => {
                onUnhandledError?.(error);
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
    }), [initializePayment, submitForm, paymentContext, rest.method, validateForm, setSubmitted, setFieldTouched, onUnhandledError, paymentUniqueId]);

    const onError = (error: Error) => {
        paymentContext?.disableSubmit(rest.method, true);

        onUnhandledError?.(error);
    };

    return <HostedWidgetPaymentMethod
        { ...rest }
        containerId={ paymentUniqueId }
        initializePayment={ initializePayPalCommercePayment }
        onUnhandledError={ onError }
        shouldShow={ shouldShowWidget }
    />;
};

export default connectFormik(PaypalCommercePaymentMethod);
