import { noop } from 'lodash';
import { useCallback, useMemo } from 'react';

import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';

export const usePropsToOnMount = (props: PaymentMethodProps): (() => () => void) => {
    const { checkoutService, method, onUnhandledError = noop } = props;
    const { initializePayment, deinitializePayment } = checkoutService;

    const options = useMemo(
        () => ({
            gatewayId: method.gateway,
            methodId: method.id,
        }),
        [method.gateway, method.id],
    );

    const onInit = useCallback(() => initializePayment(options), [initializePayment, options]);
    const onDeinit = useCallback(
        () => deinitializePayment(options),
        [deinitializePayment, options],
    );

    return useCallback(() => {
        onInit().catch(onUnhandledError);

        return () => {
            onDeinit().catch(onUnhandledError);
        };
    }, [onInit, onUnhandledError, onDeinit]);
};
