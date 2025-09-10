import { createBigCommercePaymentsPayLaterPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import React, { type FunctionComponent, useEffect } from 'react';

import { PaymentMethodId, useCheckout } from '@bigcommerce/checkout/payment-integration-api';

const BigCommercePaymentsPayLaterBanner: FunctionComponent<{
    onUnhandledError?(error: Error): void
}> = ({ onUnhandledError }) => {
    const { checkoutService } = useCheckout();

    useEffect(() => {
        try {
            void checkoutService.initializePayment({
                methodId: PaymentMethodId.BigCommercePaymentsPayLater,
                integrations: [createBigCommercePaymentsPayLaterPaymentStrategy],
                bigcommerce_payments_paylater: {
                    bannerContainerId: 'bigcommerce-payments-banner-container',
                },
            });

            void checkoutService.deinitializePayment({
                methodId: PaymentMethodId.BigCommercePaymentsPayLater,
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError?.(error);
            }
        }
    }, []);

    return (
        <div
            data-test='bigcommerce-payments-banner-container'
            id='bigcommerce-payments-banner-container'
        />
    );
};

export default BigCommercePaymentsPayLaterBanner;
