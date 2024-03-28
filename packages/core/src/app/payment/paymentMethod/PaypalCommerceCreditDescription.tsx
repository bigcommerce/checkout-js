import React, { FunctionComponent, useEffect } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import PaymentMethodId from './PaymentMethodId';

const PaypalCommerceCreditDescription: FunctionComponent<{ onUnhandledError?(error: Error): void }> = ({ onUnhandledError }) => {
    const { checkoutService } = useCheckout();

    useEffect(() => {
        try {
            checkoutService.initializePayment({
                methodId: PaymentMethodId.PaypalCommerceCredit,
                paypalcommercecredit: {
                    bannerContainerId: 'paypal-commerce-banner-container',
                },
            });

            checkoutService.deinitializePayment({
                methodId: PaymentMethodId.PaypalCommerceCredit,
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError?.(error);
            }
        }
    }, []);

    return (
        <div data-test='paypal-commerce-banner-container' id='paypal-commerce-banner-container' />
    )
}

export default PaypalCommerceCreditDescription;
