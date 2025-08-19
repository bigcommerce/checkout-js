import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useCallback } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const BraintreePaypalPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    ...rest
}) => {
    const initializeBraintreePaypalPaymentMethod = useCallback(
        (defaultOptions: PaymentInitializeOptions) => {
            const { onUnhandledError, language, method, paymentForm } = rest;

            return checkoutService.initializePayment({
                ...defaultOptions,
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
    [{ id: 'braintreepaypal' }],
);
