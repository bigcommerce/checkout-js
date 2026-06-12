import { createBigCommercePaymentsInvoicesPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import { type FunctionComponent, useEffect } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    PaymentMethodId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const BigCommercePaymentsInvoicesPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    onUnhandledError,
}) => {
    useEffect(() => {
        const initializePayment = async () => {
            try {
                await checkoutService.initializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                    integrations: [createBigCommercePaymentsInvoicesPaymentStrategy],
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
    }, [checkoutService, method.gateway, method.id, onUnhandledError]);

    return null;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BigCommercePaymentsInvoicesPaymentMethod,
    [{ id: PaymentMethodId.BigCommercePaymentsInvoices }],
);
