import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useEffect } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { PaymentMethodId } from './index';

const BraintreePaypalCreditDescription: FunctionComponent<{ onUnhandledError?(error: Error): void }> = ({ onUnhandledError }) => {
    const { checkoutService } = useCheckout();

    useEffect(() => {
        try {
            checkoutService.initializePayment({
                methodId: PaymentMethodId.BraintreePaypalCredit,
                braintree: {
                    bannerContainerId: 'braintree-banner-container',
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError?.(error);
            }
        }

        return () => {
            try {
                checkoutService.deinitializePayment({
                    methodId: PaymentMethodId.BraintreePaypalCredit,
                });
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError?.(error);
                }
            }
        }
    }, []);

    return (
        <div data-test='braintree-banner-container' id='braintree-banner-container' />
    )
}

interface PaymentMethodDescriptionProps {
    method: PaymentMethod,
    onUnhandledError?(error: Error): void;
}

const PaymentMethodDescription = ({ method, onUnhandledError }: PaymentMethodDescriptionProps) => {
    switch (method.id) {
        case PaymentMethodId.BraintreePaypalCredit:
            return <BraintreePaypalCreditDescription onUnhandledError={onUnhandledError} />

        default:
            return null;
    }
}

export default PaymentMethodDescription;
