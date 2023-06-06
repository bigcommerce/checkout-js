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

    const customer = checkoutState.data.getCustomer();
    const isInstrumentFeatureAvailable = !customer?.isGuest && method.config.isVaultingEnabled;

    useEffect(() => {
        const initializePaymentMethod = async () => {
            try {
                await checkoutService.initializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
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

        return () => {
            const deinitializePaymentMethod = async () => {
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

            void deinitializePaymentMethod();
        };
    }, [checkoutService, method.gateway, method.id, onUnhandledError]);

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

        const initializeInstruments = async () => {
            try {
                if (isInstrumentFeatureAvailable) {
                    await checkoutService.loadInstruments();
                }
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        void initializeBillingAddressFields();
        void initializeInstruments();
    }, [checkoutService, onUnhandledError, isInstrumentFeatureAvailable]);

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
        isInstrumentFeatureAvailable,
    };

    return <BraintreeAchPaymentForm {...props} />;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeAchPaymentMethod,
    [{ id: 'braintreeach' }],
);
