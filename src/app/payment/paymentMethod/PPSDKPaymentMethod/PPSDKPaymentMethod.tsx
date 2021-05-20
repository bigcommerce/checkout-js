import { CheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { initializationComponentMap } from './initializationComponentMap';
import { usePropsToOnMount } from './usePropsToOnMount';
import { Wrapper } from './Wrapper';

type CheckoutServiceInstance = InstanceType<typeof CheckoutService>;

interface Props {
    method: PaymentMethod;
    deinitializePayment: CheckoutServiceInstance['deinitializePayment'];
    initializePayment: CheckoutServiceInstance['initializePayment'];
    onUnhandledError?(error: Error): void;
}

export const PPSDKPaymentMethod: FunctionComponent<Props> = props => {
    const { method, onUnhandledError = noop } = props;

    const onMount = usePropsToOnMount(props);

    const componentKey = method?.initializationStrategy?.type || '';
    const Component = initializationComponentMap[componentKey];

    if (!Component) {
        onUnhandledError(new Error('PPSDK initialization strategy not found'));

        return null;
    }

    return (
        <Wrapper onMount={ onMount }>
            <Component { ...props } />
        </Wrapper>
    );
};
