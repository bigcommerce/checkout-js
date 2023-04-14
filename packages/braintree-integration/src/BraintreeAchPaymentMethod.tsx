import React, { FunctionComponent, useEffect } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import { BraintreeAchPaymentForm } from './components';

const mandateText = 'I authorize Braintree to debit my bank account on behalf of My Online Store.';

const BraintreeAchPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    checkoutState,
    language,
    onUnhandledError,
    paymentForm,
}) => {
    useEffect(() => {
        const { gateway: gatewayId, id: methodId } = method;

        const initialize = async () => {
            try {
                await checkoutService.loadBillingAddressFields();

                await checkoutService.initializePayment({
                    gatewayId,
                    methodId,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    braintreeach: {
                        mandateText,
                    },
                });
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        void initialize();

        return () => {
            const deinitialize = async () => {
                try {
                    await checkoutService.deinitializePayment({
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });
                } catch (error) {
                    if (error instanceof Error) {
                        onUnhandledError(error);
                    }
                }
            };

            void deinitialize();
        };
    }, [method, checkoutService, onUnhandledError]);

    const props = {
        checkoutService,
        checkoutState,
        language,
        mandateText,
        method,
        paymentForm,
    };

    return <BraintreeAchPaymentForm {...props} />;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeAchPaymentMethod,
    [{ id: 'braintreeach' }],
);
