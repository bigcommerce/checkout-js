import React, { FunctionComponent, useEffect } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const BraintreeAcceleratedCheckoutPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    paymentForm,
    onUnhandledError,
}) => {
    const containerId = 'braintree-accelerated-checkout-payment-method';

    const initializePayment = async () => {
        try {
            await checkoutService.initializePayment({
                methodId: method.id,
                braintreeacceleratedcheckout: {
                    containerId,
                    onError: (error: Error) => {
                        paymentForm.disableSubmit(method, true);
                        onUnhandledError(error);
                    },
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    const deinitializePayment = async () => {
        try {
            await checkoutService.deinitializePayment({
                methodId: method.id,
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    useEffect(() => {
        void deinitializePayment();
        void initializePayment();

        return () => {
            void deinitializePayment();
        };
    }, []);

    return <div id={containerId}></div>;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeAcceleratedCheckoutPaymentMethod,
    [{ id: 'braintreeacceleratedcheckout' }],
);
