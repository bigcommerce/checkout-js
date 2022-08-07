import { CheckoutButtonProps } from '@bigcommerce/checkout-js/payment-integration';

import React, { FunctionComponent, useEffect } from 'react';

const CheckoutButton: FunctionComponent<CheckoutButtonProps> = ({
    checkoutService: { deinitializeCustomer, initializeCustomer },
    containerId,
    methodId,
    onUnhandledError,
}) => {
    useEffect(() => {
        initializeCustomer({
            methodId,
            [methodId]: {
                container: containerId,
                onUnhandledError,
            },
        })
            .catch(onUnhandledError);

        return () => {
            deinitializeCustomer({ methodId })
                .catch(onUnhandledError);
        }
    }, [containerId, methodId]);

    return (
        <div id={ containerId } />
    );
}

export default CheckoutButton;
