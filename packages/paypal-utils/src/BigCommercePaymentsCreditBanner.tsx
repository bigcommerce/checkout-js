import React, { FunctionComponent, useEffect } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

const BigCommercePaymentsCreditBanner: FunctionComponent<{ onUnhandledError?(error: Error): void }> = ({ onUnhandledError }) => {
    const { checkoutService } = useCheckout();

    useEffect(() => {
        try {
            void checkoutService.initializePayment({
                methodId: PaymentMethodId.BigcommercePaymentsPaylater,
                bigcommercepaymentspaylater: {
                    bannerContainerId: 'bigcommerce-payments-banner-container',
                },
            });

            void checkoutService.deinitializePayment({
                methodId: PaymentMethodId.BigcommercePaymentsPaylater,
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError?.(error);
            }
        }
    }, []);

    return (
        <div data-test='bigcommerce-payments-banner-container' id='bigcommerce-payments-banner-container' />
    )
}

export default BigCommercePaymentsCreditBanner;
