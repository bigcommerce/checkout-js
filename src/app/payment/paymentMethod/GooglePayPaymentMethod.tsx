import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import WalletButtonPaymentMethod, { WalletButtonPaymentMethodProps } from './WalletButtonPaymentMethod';

export type GooglePayPaymentMethodProps = Omit<WalletButtonPaymentMethodProps, 'buttonId' | 'shouldShowEditButton'>;

const GooglePayPaymentMethod: FunctionComponent<GooglePayPaymentMethodProps> = ({
    initializePayment,
    onUnhandledError,
    ...rest
}) => {
    const initializeGooglePayPayment = useCallback(options => initializePayment({
        ...options,
        googlepaybraintree: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
        },
        googlepaystripe: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
        },
    }), [initializePayment, onUnhandledError]);

    return <WalletButtonPaymentMethod
        { ...rest }
        buttonId="walletButton"
        initializePayment={ initializeGooglePayPayment }
        shouldShowEditButton
    />;
};

export default GooglePayPaymentMethod;
