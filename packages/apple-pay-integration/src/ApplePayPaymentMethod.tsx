import React, { FunctionComponent, useEffect } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const ApplePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
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
    ApplePaymentMethod,
    [{ id: 'applepay' }],
);
