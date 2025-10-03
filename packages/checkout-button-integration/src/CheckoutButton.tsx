import React, { type FunctionComponent, useEffect } from 'react';

import {
    type CheckoutButtonProps,
    type CheckoutButtonResolveId,
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
    integrations,
}) => {
    const initializeCustomerStrategyOrThrow = async () => {
        try {
            await initializeCustomer({
                methodId,
                integrations,
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

    return (
        <div className={checkoutButtonContainerClass} data-test={containerId} id={containerId} />
    );
};

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    CheckoutButton,
    [],
);
