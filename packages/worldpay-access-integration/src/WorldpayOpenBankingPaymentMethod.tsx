import { createWorldpayAccessOpenBankingPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/worldpayaccess';
import { type FunctionComponent, useCallback, useEffect } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const WorldpayOpenBankingPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService: { initializePayment, deinitializePayment },
}) => {
    const initializeOpenBanking = useCallback(async () => {
        await initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
            integrations: [createWorldpayAccessOpenBankingPaymentStrategy],
        });
    }, [initializePayment, method]);

    const deinitializeOpenBanking = useCallback(async () => {
        await deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [deinitializePayment, method.gateway, method.id]);

    useEffect(() => {
        void initializeOpenBanking();

        return () => {
            void deinitializeOpenBanking();
        };
    }, [deinitializeOpenBanking, initializeOpenBanking]);

    return null;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    WorldpayOpenBankingPaymentMethod,
    [{ id: 'open_banking', gateway: 'worldpayaccess' }],
);
