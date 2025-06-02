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
    additionalInitializationOptions,
}) => {
    const initializeCustomerStrategyOrThrow = async () => {
        try {
            await initializeCustomer({
                methodId,
                [methodId]: {
                    container: containerId,
                    onUnhandledError,
                    onClick: () => onWalletButtonClick(methodId),
                    ...additionalInitializationOptions,
                },
            });
        } catch (error) {
            if (typeof onUnhandledError === 'function' && error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    const deinitializeCustomerStrategyOrThrow = async () => {
        try {
            await deinitializeCustomer({ methodId });
        } catch (error) {
            if (typeof onUnhandledError === 'function' && error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    useEffect(() => {
        void initializeCustomerStrategyOrThrow();

        return () => {
            void deinitializeCustomerStrategyOrThrow();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div className={checkoutButtonContainerClass} id={containerId} />;
};

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    CheckoutButton,
    [],
);
