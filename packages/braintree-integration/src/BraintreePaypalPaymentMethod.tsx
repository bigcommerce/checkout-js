import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback } from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const BraintreePaypalPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    ...rest
}) => {
    const initializeBraintreePaypalPaymentMethod = useCallback(
        (defaultOptions: PaymentInitializeOptions) => {
            const { onUnhandledError, language } = rest;

            return checkoutService.initializePayment({
                ...defaultOptions,
                braintree: {
                    onError: (error: Error) => {
                        if (error.message === 'INSTRUMENT_DECLINED') {
                            onUnhandledError?.(
                                new Error(language.translate('payment.errors.instrument_declined')),
                            );
                        } else {
                            onUnhandledError?.(error);
                        }
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
