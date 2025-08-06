import { CustomerInitializeOptions, CustomerRequestOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { ReactElement, useEffect } from 'react';

const WALLET_BUTTON_HEIGHT = 36;

export interface CheckoutButtonProps {
    containerId: string;
    methodId: string;
    isShowingWalletButtonsOnTop?: boolean;
    deinitialize(options: CustomerRequestOptions): void;
    initialize(options: CustomerInitializeOptions): void;
    onError?(error: Error): void;
    onClick?(methodId: string): void;
}

const CheckoutButton = ({
    containerId,
    methodId,
    isShowingWalletButtonsOnTop,
    deinitialize,
    initialize,
    onError,
    onClick = noop,
}: CheckoutButtonProps): ReactElement => {
    useEffect(() => {
        const heightOption = isShowingWalletButtonsOnTop && (methodId === 'braintreepaypal' || methodId === 'braintreepaypalcredit' )
            ? { buttonHeight: WALLET_BUTTON_HEIGHT }
            : {};

        initialize({
            methodId,
            [methodId]: {
                ...heightOption,
                container: containerId,
                onError,
                onClick: () => onClick(methodId),
            },
        });

        return () => {
            deinitialize({ methodId });
        };
    }, []);

    return <div id={containerId} />;
};

export default CheckoutButton;
