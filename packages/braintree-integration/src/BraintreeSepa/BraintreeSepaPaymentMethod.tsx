import React, { FunctionComponent, useEffect } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import {
    CheckoutContext,
    PaymentFormContext,
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, LoadingOverlay } from '@bigcommerce/checkout/ui';

import { BraintreeSepaPaymentForm } from './components/BraintreeSepaPaymentForm';

const BraintreeSepaPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
      method,
      checkoutService,
      checkoutState,
      onUnhandledError,
      paymentForm,
}) => {

    useEffect(() => {
        const initializePaymentOrThrow = async () => {
            try {
                await checkoutService.initializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
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
            <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                <LocaleProvider checkoutService={checkoutService}>
                    <PaymentFormContext.Provider value={{ paymentForm }}>
                        <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                            <BraintreeSepaPaymentForm
                                method={method}
                            />
                        </LoadingOverlay>
                    </PaymentFormContext.Provider>
                </LocaleProvider>
            </CheckoutContext.Provider>
        </FormContext.Provider>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeSepaPaymentMethod,
    [{ id: 'braintreesepa' }],
);
