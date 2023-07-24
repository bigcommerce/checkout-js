import React, { FunctionComponent, useEffect } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const BraintreeAcceleratedCheckoutPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    onUnhandledError,
}) => {
    const initializePayment = async () => {
        try {
            await checkoutService.initializePayment({
                methodId: method.id,
                braintreeacceleratedcheckout: {
                    container: '#braintree-axo-cc-form-container',
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
        void initializePayment();

        return () => {
            void deinitializePayment();
        };
    }, []);

    return (
        <div>
            <div id="braintree-axo-cc-form-container" />
        </div>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeAcceleratedCheckoutPaymentMethod,
    [{ id: 'braintreeacceleratedcheckout' }],
);
