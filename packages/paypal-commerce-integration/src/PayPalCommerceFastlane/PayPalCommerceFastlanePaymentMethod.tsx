import React, { FunctionComponent, useEffect, useRef } from 'react';
import { CardInstrument } from '@bigcommerce/checkout-sdk';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import {
    CheckoutContext,
    PaymentFormContext,
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, LoadingOverlay } from '@bigcommerce/checkout/ui';

import PayPalCommerceFastlaneForm from './components/PayPalCommerceFastlaneForm';

export interface PayPalFastlaneCardComponentRef {
    renderPayPalCardComponent?: (container: string) => void;
    showPayPalCardSelector?: () => Promise<CardInstrument | undefined>;
}

const PayPalCommerceFastlanePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    checkoutState,
    onUnhandledError,
    paymentForm,
}) => {
    const paypalCardComponentRef = useRef<PayPalFastlaneCardComponentRef>({});

    const { isLoadingPaymentMethod, isInitializingPayment } = checkoutState.statuses;

    const initializePaymentOrThrow = async () => {
        try {
            await checkoutService.initializePayment({
                methodId: method.id,
                paypalcommerceacceleratedcheckout: {
                    onInit: (renderPayPalCardComponent) => {
                        paypalCardComponentRef.current.renderPayPalCardComponent =
                            renderPayPalCardComponent;
                    },
                    onChange: (showPayPalCardSelector) => {
                        paypalCardComponentRef.current.showPayPalCardSelector =
                            showPayPalCardSelector;
                    },
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    const deinitializePaymentOrThrow = async () => {
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
        void initializePaymentOrThrow();

        return () => {
            void deinitializePaymentOrThrow();
        };
    }, []);

    const isLoading = isInitializingPayment() || isLoadingPaymentMethod(method.id);

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
                            <PayPalCommerceFastlaneForm
                                renderPayPalCardComponent={
                                    paypalCardComponentRef.current.renderPayPalCardComponent
                                }
                                showPayPalCardSelector={
                                    paypalCardComponentRef.current.showPayPalCardSelector
                                }
                            />
                        </LoadingOverlay>
                    </PaymentFormContext.Provider>
                </LocaleProvider>
            </CheckoutContext.Provider>
        </FormContext.Provider>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PayPalCommerceFastlanePaymentMethod,
    [{ id: 'paypalcommerceacceleratedcheckout' }],
);
