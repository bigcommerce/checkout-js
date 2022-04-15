import { CheckoutButtonInitializeOptions, CheckoutButtonOptions } from '@bigcommerce/checkout-sdk';
import React, { useEffect, ReactElement } from 'react';

import { SmartButtonProvider } from './SmartButtonsList';

export interface SmartButtonProps {
    containerId: string;
    smartButtonProvider: SmartButtonProvider;
    deinitializeSmartButton(options: CheckoutButtonOptions): void;
    initializeSmartButton(options: CheckoutButtonInitializeOptions): void;
}

const SmartButton = ({
    containerId,
    smartButtonProvider,
    initializeSmartButton,
    deinitializeSmartButton,
}: SmartButtonProps): ReactElement => {
    const { methodId, initializationOptions } = smartButtonProvider;

    useEffect(() => {
        initializeSmartButton({
            containerId,
            methodId,
            [methodId]: {
                ...initializationOptions,
            },
        });

        return () => deinitializeSmartButton({ methodId });
    }, []);

    return (
        <div id={ containerId } />
    );
};

export default SmartButton;
