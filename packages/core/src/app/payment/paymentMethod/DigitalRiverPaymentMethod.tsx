import { noop } from 'lodash';
import React, { FunctionComponent, useCallback, useContext } from 'react';
import { Omit } from 'utility-types';

import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { FormContext } from '@bigcommerce/checkout/ui';

import { CustomError } from '../../common/error';
import { connectFormik, ConnectFormikProps } from '../../common/form';

import HostedDropInPaymentMethod from './HostedDropInPaymentMethod';
import { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type DigitalRiverPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'> &
    ConnectFormikProps<PaymentFormValues>;

export enum DigitalRiverClasses {
    base = 'form-input optimizedCheckout-form-input',
}

const DigitalRiverPaymentMethod: FunctionComponent<
    DigitalRiverPaymentMethodProps & WithLanguageProps
> = ({ initializePayment, language, onUnhandledError = noop, formik: { submitForm }, ...rest }) => {
    const { setSubmitted } = useContext(FormContext);
    const containerId = `${rest.method.id}-component-field`;
    const isVaultingEnabled = rest.method.config.isVaultingEnabled;

    const initializeDigitalRiverPayment = useCallback(
        (options) =>
            initializePayment({
                ...options,
                digitalriver: {
                    containerId,
                    configuration: {
                        flow: 'checkout',
                        showSavePaymentAgreement: isVaultingEnabled,
                        showComplianceSection: false,
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
                    onError: () => {
                        onUnhandledError(
                            new Error(language.translate('payment.digitalriver_dropin_error')),
                        );
                    },
                },
            }),
        [
            initializePayment,
            containerId,
            isVaultingEnabled,
            setSubmitted,
            submitForm,
            onUnhandledError,
            language,
        ],
    );

    const onError = (error: CustomError) => {
        if (error.name === 'digitalRiverCheckoutError') {
            error = new CustomError({
                title: language.translate('payment.digitalriver_checkout_error_title'),
                message: language.translate(error.type),
                data: {},
                name: 'digitalRiverCheckoutError',
            });
        }

        onUnhandledError(error);
    };

    return (
        <HostedDropInPaymentMethod
            {...rest}
            containerId={containerId}
            hideVerificationFields
            initializePayment={initializeDigitalRiverPayment}
            onUnhandledError={onError}
        />
    );
};

export default connectFormik(withLanguage(DigitalRiverPaymentMethod));
