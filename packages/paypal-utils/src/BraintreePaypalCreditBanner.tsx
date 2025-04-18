import React, { FunctionComponent, useEffect } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

const BraintreePaypalCreditBanner: FunctionComponent<{ onUnhandledError?(error: Error): void }> = ({ onUnhandledError }) => {
    const { checkoutService } = useCheckout();

    useEffect(() => {
        try {
            void checkoutService.initializePayment({
                methodId: PaymentMethodId.BraintreePaypalCredit,
                braintree: {
                    bannerContainerId: 'braintree-banner-container',
                },
            });

            void checkoutService.deinitializePayment({
                methodId: PaymentMethodId.BraintreePaypalCredit,
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError?.(error);
            }
        }

        return () => {
            try {
                void checkoutService.deinitializePayment({
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

export default BraintreePaypalCreditBanner;
