import { createApplePayPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/apple-pay';
import React, { type FunctionComponent, useEffect } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const ApplePayPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    language,
    onUnhandledError,
}) => {
    useEffect(() => {
        const initializePayment = async () => {
            try {
                await checkoutService.initializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                    integrations: [createApplePayPaymentStrategy],
                    applepay: {
                        shippingLabel: language.translate('cart.shipping_text'),
                        subtotalLabel: language.translate('cart.subtotal_text'),
                    },
                });
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        void initializePayment();

        return () => {
            const deinitializePayment = async () => {
                try {
                    await checkoutService.deinitializePayment({
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });
                } catch (error) {
                    if (error instanceof Error) {
                        onUnhandledError(error);
                    }
                }
            };

            void deinitializePayment();
        };
    }, [checkoutService, language, method, onUnhandledError]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    ApplePayPaymentMethod,
    [{ id: 'applepay' }],
);
