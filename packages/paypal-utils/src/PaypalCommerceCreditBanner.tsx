import React, { FunctionComponent, useEffect } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

const PaypalCommerceCreditBanner: FunctionComponent<{ onUnhandledError?(error: Error): void }> = ({ onUnhandledError }) => {
    const { checkoutService } = useCheckout();

    useEffect(() => {
        try {
            void checkoutService.initializePayment({
                methodId: PaymentMethodId.PaypalCommerceCredit,
                paypalcommercecredit: {
                    bannerContainerId: 'paypal-commerce-banner-container',
                },
            });

            void checkoutService.deinitializePayment({
                methodId: PaymentMethodId.PaypalCommerceCredit,
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError?.(error);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div data-test='paypal-commerce-banner-container' id='paypal-commerce-banner-container' />
    )
}

export default PaypalCommerceCreditBanner;
