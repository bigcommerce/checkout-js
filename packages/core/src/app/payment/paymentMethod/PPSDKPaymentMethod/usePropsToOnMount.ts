import { CheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import { useCallback, useMemo } from 'react';

type CheckoutServiceInstance = InstanceType<typeof CheckoutService>;

interface Props {
    method: PaymentMethod;
    deinitializePayment: CheckoutServiceInstance['deinitializePayment'];
    initializePayment: CheckoutServiceInstance['initializePayment'];
    onUnhandledError?(error: Error): void;
}

export const usePropsToOnMount = (props: Props): (() => () => void) => {
    const { initializePayment, deinitializePayment, method, onUnhandledError = noop } = props;

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
