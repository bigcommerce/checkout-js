import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';

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
    const [isInitialize, setIsInitialize] = useState(false);
    const [currentMandateText, setCurrentMandateText] = useState<string>('');
    const currentMandateTextRef = useRef('');

    useEffect(() => {
        currentMandateTextRef.current = currentMandateText;
    }, [currentMandateText]);

    const getMandateText = useCallback(() => {
        return currentMandateTextRef.current;
    }, []);

    const initializePayment = useCallback(async () => {
        const { gateway: gatewayId, id: methodId } = method;

        try {
            await checkoutService.initializePayment({
                gatewayId,
                methodId,
                braintreeach: {
                    getMandateText,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    }, [checkoutService, getMandateText, method, onUnhandledError]);

    useEffect(() => {
        if (!isInitialize) {
            setIsInitialize(true);
            void initializePayment();
        }
    }, [initializePayment, isInitialize]);

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
        setCurrentMandateText,
    };

    return <BraintreeAchPaymentForm {...props} />;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeAchPaymentMethod,
    [{ id: 'braintreeach' }],
);
