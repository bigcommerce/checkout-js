import React, { type FunctionComponent, useEffect } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

interface BraintreePaypalCreditBannerProps {
    methodId: string;
    containerId: string;
    onUnhandledError?(error: Error): void;
}

const BraintreePaypalCreditBanner: FunctionComponent<BraintreePaypalCreditBannerProps> = ({
    methodId,
    containerId,
    onUnhandledError,
}) => {
    const { checkoutService } = useCheckout();

    useEffect(() => {
        try {
            void checkoutService.initializePayment({
                methodId,
                braintree: {
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

        return () => {
            try {
                void checkoutService.deinitializePayment({
                    methodId,
                });
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError?.(error);
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div data-test={containerId} id={containerId} />;
};

export default BraintreePaypalCreditBanner;
