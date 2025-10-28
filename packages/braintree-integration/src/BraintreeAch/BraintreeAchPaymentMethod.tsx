import { createBraintreeAchPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/braintree';
import React, { type FunctionComponent, useEffect, useRef } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, LoadingOverlay } from '@bigcommerce/checkout/ui';

import BraintreeAchPaymentForm from './components/BraintreeAchPaymentForm';

const BraintreeAchPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    checkoutState,
    onUnhandledError,
    paymentForm,
}) => {
    const currentMandateTextRef = useRef('');
    const updateMandateText = (currentMandateText: string) => {
        currentMandateTextRef.current = currentMandateText;
    };

    useEffect(() => {
        const initializePaymentOrThrow = async () => {
            try {
                await checkoutService.initializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                    integrations: [createBraintreeAchPaymentStrategy],
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

        void initializePaymentOrThrow();

        return () => {
            const deinitializePaymentOrThrow = async () => {
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

            void deinitializePaymentOrThrow();
        };
    }, [checkoutService, method.gateway, method.id, onUnhandledError]);

    useEffect(() => {
        const loadInstrumentsOrThrow = async () => {
            try {
                await checkoutService.loadInstruments();
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        const { isGuest } = checkoutState.data.getCustomer() || {};

        const shouldLoadInstruments = !isGuest && method.config.isVaultingEnabled;

        if (shouldLoadInstruments) {
            void loadInstrumentsOrThrow();
        }
    }, []);

    const isLoading =
        checkoutState.statuses.isLoadingInstruments() ||
        checkoutState.statuses.isLoadingPaymentMethod(method.id);

    const formContextProps = {
        isSubmitted: paymentForm.isSubmitted(),
        setSubmitted: paymentForm.setSubmitted,
    };

    return (
        <FormContext.Provider value={formContextProps}>
            <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                <BraintreeAchPaymentForm method={method} updateMandateText={updateMandateText} />
            </LoadingOverlay>
        </FormContext.Provider>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeAchPaymentMethod,
    [{ id: 'braintreeach' }],
);
