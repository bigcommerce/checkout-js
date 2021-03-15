import React, { useCallback, useContext, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { connectFormik, ConnectFormikProps } from '../../common/form';
import { FormContext } from '../../ui/form';
import PaymentContext from '../PaymentContext';
import { PaymentFormValues } from '../PaymentForm';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type DigitalRiverPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'> & ConnectFormikProps<PaymentFormValues>;

export enum DigitalRiverClasses {
    base =  'form-input optimizedCheckout-form-input',
}

const DigitalRiverPaymentMethod: FunctionComponent<DigitalRiverPaymentMethodProps> = ({
    initializePayment,
    onUnhandledError,
    formik: { submitForm },
    ...rest
}) => {
    const paymentContext = useContext(PaymentContext);
    const { setSubmitted } = useContext(FormContext);
    const containerId = `${rest.method}-component-field`;
    const initializeDigitalRiverPayment = useCallback(options => initializePayment({
        ...options,
        digitalriver: {
            containerId,
            configuration: {
                flow: 'checkout',
                showSavePaymentAgreement: false,
                showComplianceSection: true,
                button: {
                    type: 'submitOrder',
                },
                usage: 'unscheduled',
                showTermsOfSaleDisclosure: true,
                paymentMethodConfiguration: {
                    disabledPaymentMethods: [
                        'klarnaCredit',
                        'payPal',
                        'payPalCredit',
                        'payPalBilling',
                    ],
                    classes: DigitalRiverClasses,
                },
            },
            onRenderButton: () => {
                paymentContext?.hidePaymentSubmitButton?.(rest.method, true);
            },
            onSubmitForm: () => {
                setSubmitted(true);
                submitForm();
            },
            onError: (error: Error) => {
                onUnhandledError?.(error);
            },
        },
    }), [containerId, initializePayment, submitForm, paymentContext, rest.method, setSubmitted, onUnhandledError]);

    return <HostedWidgetPaymentMethod
        { ...rest }
        containerId={ containerId }
        initializePayment={ initializeDigitalRiverPayment }
    />;
};

export default connectFormik(DigitalRiverPaymentMethod);
