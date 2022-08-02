import { toResolvableComponent, PaymentMethodProps } from '@bigcommerce/checkout-js/payment-integration';
import React, { FunctionComponent, useEffect } from 'react';

const ApplePaymentMethod: FunctionComponent<PaymentMethodProps> = ({ method, checkoutService, language, onUnhandledError }) => {
    useEffect(() => {
        const initializePayment = async () => {
            try {
                await checkoutService.initializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                    applepay: {
                        shippingLabel: language.translate('cart.shipping_text'),
                        subtotalLabel: language.translate('cart.subtotal_text'),
                    },
                });
            } catch (error) {
                onUnhandledError(error);
            }
        };
        initializePayment();

        return () => {
            const deinitializePayment = async () => {
                try {
                    await checkoutService.deinitializePayment({
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });
                } catch (error) {
                    onUnhandledError(error);
                }
            };
            deinitializePayment();
        }
    }, [checkoutService, language, method, onUnhandledError]);

    return <></>;
};

export default toResolvableComponent(
    ApplePaymentMethod,
    [{ id: 'applepay' }]
);
