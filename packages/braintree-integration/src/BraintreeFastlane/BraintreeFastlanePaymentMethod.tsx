import { type CardInstrument } from '@bigcommerce/checkout-sdk';
import { createBraintreeFastlanePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/braintree';
import React, { type FunctionComponent, useEffect, useRef } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, LoadingOverlay } from '@bigcommerce/checkout/ui';

import BraintreeFastlaneForm from './components/BraintreeFastlaneForm';

import './BraintreeFastlanePaymentMethod.scss';

export interface BraintreeFastlaneComponentRef {
    renderPayPalCardComponent?: (container: string) => void;
    showPayPalCardSelector?: () => Promise<CardInstrument | undefined>;
}

const BraintreeFastlanePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
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
                integrations: [createBraintreeFastlanePaymentStrategy],
                braintreefastlane: {
                    onInit: (renderPayPalCardComponent) => {
                        paypalFastlaneComponentRef.current.renderPayPalCardComponent =
                            renderPayPalCardComponent;
                    },
                    onChange: (showPayPalCardSelector) => {
                        paypalFastlaneComponentRef.current.showPayPalCardSelector =
                            showPayPalCardSelector;
                    },
                    onError: (error: Error) => {
                        onUnhandledError(error);
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
            <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                <BraintreeFastlaneForm
                    renderPayPalCardComponent={
                        paypalFastlaneComponentRef?.current?.renderPayPalCardComponent
                    }
                    showPayPalCardSelector={
                        paypalFastlaneComponentRef.current?.showPayPalCardSelector
                    }
                />
            </LoadingOverlay>
        </FormContext.Provider>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeFastlanePaymentMethod,
    [{ id: 'braintreeacceleratedcheckout' }],
);
