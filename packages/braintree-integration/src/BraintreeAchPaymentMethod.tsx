import React, { FunctionComponent, useEffect, useRef } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import { BraintreeAchPaymentForm } from './components';

const BraintreeAchPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    checkoutState,
    language,
    onUnhandledError,
    paymentForm,
}) => {
    const currentMandateTextRef = useRef('');

    const updateMandateText = (currentMandateText: string) => {
        currentMandateTextRef.current = currentMandateText;
    };

    useEffect(() => {
        const initializePaymentMethod = async () => {
            const { gateway: gatewayId, id: methodId } = method;

            try {
                await checkoutService.initializePayment({
                    gatewayId,
                    methodId,
                    braintreeach: {
                        getMandateText: () => currentMandateTextRef.current,
                    },
                });
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        void initializePaymentMethod();
    }, [checkoutService, method, onUnhandledError]);

    useEffect(() => {
        const initializeBillingAddressFields = async () => {
            try {
                await checkoutService.loadBillingAddressFields();
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        void initializeBillingAddressFields();
    }, [checkoutService, onUnhandledError]);

    const props = {
        checkoutService,
        checkoutState,
        language,
        method,
        paymentForm,
        storeName: checkoutState.data.getConfig()?.storeProfile.storeName,
        outstandingBalance: checkoutState.data.getCheckout()?.outstandingBalance,
        symbol: checkoutState.data.getCart()?.currency.symbol,
        updateMandateText,
    };

    return <BraintreeAchPaymentForm {...props} />;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeAchPaymentMethod,
    [{ id: 'braintreeach' }],
);
