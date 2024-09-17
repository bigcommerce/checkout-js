import { noop } from 'lodash';
import React, { FunctionComponent, useCallback, useContext } from 'react';

import { HostedDropInPaymentMethodComponent } from '@bigcommerce/checkout/hosted-dropin-integration';
import {
    CustomError,
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { FormContext } from '@bigcommerce/checkout/ui';

export enum DigitalRiverClasses {
    base = 'form-input optimizedCheckout-form-input',
}

const DigitalRiverPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    language,
    checkoutService,
    checkoutState,
    paymentForm,
    method,
    onUnhandledError = noop,
    ...rest
}) => {
    const { setSubmitted } = useContext(FormContext);
    const containerId = `${method.id}-component-field`;
    const isVaultingEnabled = method.config.isVaultingEnabled;

    const initializeDigitalRiverPayment = useCallback(
        (options) =>
            checkoutService.initializePayment({
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
                        paymentForm.submitForm();
                    },
                    onError: () => {
                        onUnhandledError(
                            new Error(language.translate('payment.digitalriver_dropin_error')),
                        );
                    },
                },
            }),
        [
            checkoutService,
            containerId,
            isVaultingEnabled,
            setSubmitted,
            paymentForm,
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
        <HostedDropInPaymentMethodComponent
            {...rest}
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            containerId={containerId}
            deinitializePayment={checkoutService.deinitializePayment}
            hideVerificationFields
            initializePayment={initializeDigitalRiverPayment}
            language={language}
            method={method}
            onUnhandledError={onError}
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    DigitalRiverPaymentMethod,
    [{ id: 'digitalriver' }],
);
