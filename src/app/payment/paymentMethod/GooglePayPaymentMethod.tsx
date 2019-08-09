import React, { FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import WalletButtonPaymentMethod, { WalletButtonPaymentMethodProps } from './WalletButtonPaymentMethod';

export type GooglePayPaymentMethodProps = Omit<WalletButtonPaymentMethodProps, 'buttonId' | 'shouldShowEditButton'>;

const GooglePayPaymentMethod: FunctionComponent<GooglePayPaymentMethodProps> = ({
    initializePayment,
    onUnhandledError,
    ...rest
}) => (
    <WalletButtonPaymentMethod
        { ...rest }
        buttonId="walletButton"
        initializePayment={ options => initializePayment({
            ...options,
            googlepaybraintree: {
                walletButton: 'walletButton',
                onError: onUnhandledError,
            },
            googlepaystripe: {
                walletButton: 'walletButton',
                onError: onUnhandledError,
            },
        }) }
        shouldShowEditButton
    />
);

export default GooglePayPaymentMethod;
