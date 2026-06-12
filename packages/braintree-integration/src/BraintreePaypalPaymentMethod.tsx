import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createBraintreePaypalPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/braintree';
import React, { type FunctionComponent, useCallback, useEffect, useRef } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

interface ButtonActions {
    disable: () => void;
    enable: () => void;
}

const BraintreePaypalPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    ...rest
}) => {
    const buttonActionsRef = useRef<ButtonActions | null>(null);
    const termsValue = rest.paymentForm.getFieldValue('terms');

    const validateForm = async () => {
        const validationErrors = await rest.paymentForm.validateForm();

        return Object.keys(validationErrors);
    };

    const validateButton = async () => {
        if (!buttonActionsRef.current) return;

        const keysValidation = await validateForm();

        if (keysValidation.length) {
            buttonActionsRef.current.disable();
        } else {
            buttonActionsRef.current.enable();
        }
    };

    useEffect(() => {
        void validateButton();
    }, [termsValue]);

    const initializeBraintreePaypalPaymentMethod = useCallback(
        (defaultOptions: PaymentInitializeOptions) => {
            const { onUnhandledError, language, method, paymentForm } = rest;

            return checkoutService.initializePayment({
                ...defaultOptions,
                integrations: [createBraintreePaypalPaymentStrategy],
                braintree: {
                    containerId: '#checkout-payment-continue',
                    submitForm: () => {
                        paymentForm.setSubmitted(true);
                        paymentForm.submitForm();
                    },
                    onError: (error: Error) => {
                        if (error.message === 'INSTRUMENT_DECLINED') {
                            onUnhandledError?.(
                                new Error(language.translate('payment.errors.instrument_declined')),
                            );
                        } else {
                            onUnhandledError?.(error);
                        }
                    },
                    onValidate: async (resolve: () => void, reject: () => void): Promise<void> => {
                        const keysValidation = await validateForm();

                        if (keysValidation.length) {
                            paymentForm.setSubmitted(true);
                            keysValidation.forEach((key) => paymentForm.setFieldTouched(key));

                            return reject();
                        }

                        return resolve();
                    },
                    onInitButton: async (actions: ButtonActions) => {
                        buttonActionsRef.current = actions;
                        await validateButton();
                    },
                    onRenderButton: () => {
                        paymentForm.hidePaymentSubmitButton(method, true);
                    },
                },
            });
        },
        [rest, checkoutService],
    );

    return (
        <HostedPaymentComponent
            {...rest}
            checkoutService={checkoutService}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={initializeBraintreePaypalPaymentMethod}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreePaypalPaymentMethod,
    [{ id: 'braintreepaypal' }, { id: 'braintreepaypalcredit' }],
);
