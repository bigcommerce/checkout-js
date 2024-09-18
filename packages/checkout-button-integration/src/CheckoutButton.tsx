import React, { FunctionComponent, useEffect } from 'react';

import {
    CheckoutButtonProps,
    CheckoutButtonResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const CheckoutButton: FunctionComponent<CheckoutButtonProps> = ({
    checkoutService: { deinitializeCustomer, initializeCustomer },
    checkoutButtonContainerClass,
    containerId,
    methodId,
    onUnhandledError,
    onWalletButtonClick,
}) => {
    useEffect(() => {
        initializeCustomer({
            methodId,
            [methodId]: {
                container: containerId,
                onUnhandledError,
                onClick: () => onWalletButtonClick(methodId),
            },
        }).catch(onUnhandledError);

        return () => {
            deinitializeCustomer({ methodId }).catch(onUnhandledError);
        };
    }, [
        containerId,
        deinitializeCustomer,
        initializeCustomer,
        methodId,
        onUnhandledError,
        onWalletButtonClick,
    ]);

    return <div className={checkoutButtonContainerClass} id={containerId} />;
};

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    CheckoutButton,
    [],
);
