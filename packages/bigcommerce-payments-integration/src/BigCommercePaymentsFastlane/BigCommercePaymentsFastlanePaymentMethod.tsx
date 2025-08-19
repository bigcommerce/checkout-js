import { type CardInstrument } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, useEffect, useRef } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import {
    CheckoutContext,
    PaymentFormContext,
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, LoadingOverlay } from '@bigcommerce/checkout/ui';

import BigCommercePaymentsFastlaneForm from './components/BigCommercePaymentsFastlaneForm';

import './BigCommercePaymentsFastlanePaymentMethod.scss';
import { isErrorWithTranslationKey } from '@bigcommerce/checkout/utility';

export interface BigCommercePaymentsFastlaneCardComponentRef {
    renderPayPalCardComponent?: (container: string) => void;
    showPayPalCardSelector?: () => Promise<CardInstrument | undefined>;
}

const BigCommercePaymentsFastlanePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    checkoutState,
    onUnhandledError,
    paymentForm,
    language,
}) => {
    const paypalCardComponentRef = useRef<BigCommercePaymentsFastlaneCardComponentRef>({});

    const { isLoadingPaymentMethod, isInitializingPayment } = checkoutState.statuses;

    const initializePaymentOrThrow = async () => {
        try {
            await checkoutService.initializePayment({
                methodId: method.id,

                bigcommerce_payments_fastlane: {
                    onInit: (renderPayPalCardComponent) => {
                        paypalCardComponentRef.current.renderPayPalCardComponent =
                            renderPayPalCardComponent;
                    },
                    onChange: (showPayPalCardSelector) => {
                        paypalCardComponentRef.current.showPayPalCardSelector =
                            showPayPalCardSelector;
                    },
                    onError: (error: unknown) => {
                        let finalError: Error;

                        if (isErrorWithTranslationKey(error)) {
                            finalError = new Error(language.translate(error.translationKey));
                        } else if (error instanceof Error) {
                            finalError = error;
                        } else {
                            finalError = new Error(
                                language.translate('payment.errors.general_error'),
                            );
                        }

                        return onUnhandledError(finalError);
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
                            <BigCommercePaymentsFastlaneForm
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
    BigCommercePaymentsFastlanePaymentMethod,
    [{ id: 'bigcommerce_payments_fastlane' }],
);
