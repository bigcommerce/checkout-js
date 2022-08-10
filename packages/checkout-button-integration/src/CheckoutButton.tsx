import { CheckoutButtonProps, CheckoutButtonResolveId, toResolvableComponent } from '@bigcommerce/checkout/payment-integration-api';

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
    }, [
        containerId, 
        deinitializeCustomer,
        initializeCustomer, 
        methodId,
        onUnhandledError,
    ]);

    return (
        <div id={ containerId } />
    );
}

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    CheckoutButton,
    [{ default: true }]
);
