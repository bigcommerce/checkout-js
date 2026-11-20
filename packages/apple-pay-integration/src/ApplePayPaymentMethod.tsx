import { createApplePayPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/apple-pay';
import React, { type FunctionComponent, useEffect } from 'react';

import { WalletVaultingFields } from '@bigcommerce/checkout/instrument-utils';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

// Apple Pay merchant validation responds with 417 when the merchant ID is not authorized
// for the root merchant ID (Mass Enablement / WWDR registration issue).
const MERCHANT_NOT_AUTHORIZED_STATUS = 417;

const isMerchantNotAuthorizedError = (error: Error): boolean =>
    'status' in error && error.status === MERCHANT_NOT_AUTHORIZED_STATUS;

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
                        onError: (error: Error) => {
                            if (isMerchantNotAuthorizedError(error)) {
                                onUnhandledError(
                                    new Error(
                                        language.translate(
                                            'payment.apple_pay_merchant_not_authorized_error',
                                        ),
                                    ),
                                );
                            } else {
                                onUnhandledError(error);
                            }
                        },
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

    return <WalletVaultingFields method={method} />;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    ApplePayPaymentMethod,
    [{ id: 'applepay' }],
);
