import React, { useCallback, useContext, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { connectFormik, ConnectFormikProps } from '../../common/form';
import { FormContext } from '../../ui/form';
import { PaymentFormValues } from '../PaymentForm';

import HostedDropInPaymentMethod from './HostedDropInPaymentMethod';
import { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

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
    const { setSubmitted } = useContext(FormContext);
    const containerId = `${rest.method.id}-component-field`;
    const isVaultingEnabled = rest.method.config.isVaultingEnabled;

    const initializeDigitalRiverPayment = useCallback(options => initializePayment({
        ...options,
        digitalriver: {
            containerId,
            configuration: {
                flow: 'checkout',
                showSavePaymentAgreement: isVaultingEnabled,
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
            onSubmitForm: () => {
                setSubmitted(true);
                submitForm();
            },
            onError: (error: Error) => {
                onUnhandledError?.(error);
            },
        },
    }), [initializePayment, containerId, isVaultingEnabled, setSubmitted, submitForm, onUnhandledError]);

    return <HostedDropInPaymentMethod
        { ...rest }
        containerId={ containerId }
        hideVerificationFields
        initializePayment={ initializeDigitalRiverPayment }
    />;
};

export default connectFormik(DigitalRiverPaymentMethod);
