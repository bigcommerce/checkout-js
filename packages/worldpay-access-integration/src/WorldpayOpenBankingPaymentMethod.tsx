import { createWorldpayAccessOpenBankingPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/worldpayaccess';
import { type FunctionComponent, useEffect } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const WorldpayOpenBankingPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService: { initializePayment, deinitializePayment },
    onUnhandledError,
}) => {
    useEffect(() => {
        const initializeOpenBanking = async () => {
            try {
                await initializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                    integrations: [createWorldpayAccessOpenBankingPaymentStrategy],
                });
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        void initializeOpenBanking();

        return () => {
            const deinitializeOpenBanking = async () => {
                try {
                    await deinitializePayment({
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });
                } catch (error) {
                    if (error instanceof Error) {
                        onUnhandledError(error);
                    }
                }
            };

            void deinitializeOpenBanking();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    WorldpayOpenBankingPaymentMethod,
    [{ id: 'open_banking', gateway: 'worldpayaccess' }],
);
