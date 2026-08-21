import { createBigCommercePaymentsInvoicesPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import { type FunctionComponent, useEffect } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const BigCommercePaymentsInvoicesPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    checkoutState,
    onUnhandledError,
}) => {
    const isPaymentDataRequired = checkoutState.data.isPaymentDataRequired();

    useEffect(() => {
        if (!isPaymentDataRequired) {
            return;
        }

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
    }, [checkoutService, method.gateway, method.id, onUnhandledError, isPaymentDataRequired]);

    return null;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BigCommercePaymentsInvoicesPaymentMethod,
    [{ id: 'bigcommerce_payments_invoices' }],
);
