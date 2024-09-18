import React, { FunctionComponent, useEffect } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import PaymentMethodId from './PaymentMethodId';

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

            checkoutService.deinitializePayment({
                methodId: PaymentMethodId.BraintreePaypalCredit,
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

export default BraintreePaypalCreditDescription;
