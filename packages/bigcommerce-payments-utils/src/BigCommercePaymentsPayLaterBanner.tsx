import {
    createBigCommercePaymentsPayLaterPaymentStrategy,
    createBigCommercePaymentsPaymentStrategy,
} from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import React, { type FunctionComponent, useEffect } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';

const BigCommercePaymentsPayLaterBanner: FunctionComponent<{
    methodId: string;
    containerId: string;
    onUnhandledError?(error: Error): void;
}> = ({ methodId, containerId, onUnhandledError }) => {
    const { checkoutService } = useCheckout();

    useEffect(() => {
        try {
            void checkoutService.initializePayment({
                methodId,
                integrations: [
                    createBigCommercePaymentsPayLaterPaymentStrategy,
                    createBigCommercePaymentsPaymentStrategy,
                ],
                [methodId]: {
                    bannerContainerId: containerId,
                },
            });

            void checkoutService.deinitializePayment({
                methodId,
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError?.(error);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div data-test={containerId} id={containerId} />;
};

export default BigCommercePaymentsPayLaterBanner;
