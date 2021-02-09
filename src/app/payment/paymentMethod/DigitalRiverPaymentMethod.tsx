import React, { useCallback, useContext, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { connectFormik, ConnectFormikProps } from '../../common/form';
import { FormContext } from '../../ui/form';
import PaymentContext from '../PaymentContext';
import { PaymentFormValues } from '../PaymentForm';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type DigitalRiverPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'> & ConnectFormikProps<PaymentFormValues>;

export enum DigitalRiverClasses {
    base =  'DRElement',
    complete = 'complete',
    empty = 'empty',
    focus = 'focus',
    invalid = 'invalid',
    webkitAutofill = 'autofill',
}

const DigitalRiverPaymentMethod: FunctionComponent<DigitalRiverPaymentMethodProps> = ({
    initializePayment,
    onUnhandledError,
    formik: { submitForm },
    ...rest
}) => {

    const paymentContext = useContext(PaymentContext);
    const { setSubmitted } = useContext(FormContext);

    const initializeDigitalRiverPayment = useCallback(options => initializePayment({
        ...options,
        digitalriver: {
            container: 'drop-in',
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
                    classes: DigitalRiverClasses,
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
        },
    }), [initializePayment, submitForm, paymentContext, rest.method, setSubmitted, onUnhandledError]);

    const onError = (error: Error) => {
        paymentContext?.disableSubmit(rest.method, true);

        onUnhandledError?.(error);
    };

    return <HostedWidgetPaymentMethod
        { ...rest }
        containerId="drop-in"
        initializePayment={ initializeDigitalRiverPayment }
        onUnhandledError={ onError }
    />;
};

export default connectFormik(DigitalRiverPaymentMethod);
