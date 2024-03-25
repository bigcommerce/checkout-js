import React, { FunctionComponent, useEffect, useRef } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import {
    CheckoutContext,
    PaymentFormContext,
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, LoadingOverlay } from '@bigcommerce/checkout/ui';
import { CardInstrument } from '@bigcommerce/checkout-sdk';

import BraintreeAcceleratedCheckoutForm from './components/BraintreeAcceleratedCheckoutForm';

export interface BraintreeFastlaneComponentRef {
    render?: (container: string) => void;
    showPayPalCardSelector?: () => Promise<CardInstrument | undefined>;
}

const BraintreeAcceleratedCheckoutPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    checkoutState,
    onUnhandledError,
    paymentForm,
}) => {
    const paypalFastlaneComponentRef = useRef<BraintreeFastlaneComponentRef>({});

    const { isLoadingPaymentMethod, isInitializingPayment } = checkoutState.statuses;

    const initializePaymentOrThrow = async () => {
        try {
            await checkoutService.initializePayment({
                methodId: method.id,
                braintreefastlane: {
                    onInit: (renderPayPalConnectComponentMethod) => {
                        paypalFastlaneComponentRef.current.render =
                            renderPayPalConnectComponentMethod;
                    },
                    onChange: (showPayPalCardSelector) => {
                        paypalFastlaneComponentRef.current.showPayPalCardSelector =
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
                            <BraintreeAcceleratedCheckoutForm
                                renderPayPalConnectComponent={
                                    paypalFastlaneComponentRef?.current?.render
                                }
                                showPayPalCardSelector={
                                    paypalFastlaneComponentRef.current?.showPayPalCardSelector
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
    BraintreeAcceleratedCheckoutPaymentMethod,
    [{ id: 'braintreeacceleratedcheckout' }],
);
