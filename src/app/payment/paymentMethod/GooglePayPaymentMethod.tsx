import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { connectFormik, ConnectFormikProps } from '../../common/form';
import { PaymentFormValues } from '../PaymentForm';

import WalletButtonPaymentMethod, { WalletButtonPaymentMethodProps } from './WalletButtonPaymentMethod';

export type GooglePayPaymentMethodProps = Omit<WalletButtonPaymentMethodProps, 'buttonId' | 'shouldShowEditButton'> & ConnectFormikProps<PaymentFormValues>;

const GooglePayPaymentMethod: FunctionComponent<GooglePayPaymentMethodProps> = ({
    initializePayment,
    onUnhandledError,
    ...rest
}) => {
    const initializeGooglePayPayment = useCallback(options => initializePayment({
        ...options,
        googlepayadyenv2: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
        },
        googlepayauthorizenet: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
        },
        googlepaybraintree: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
        },
        googlepaystripe: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
        },
        googlepaycybersourcev2: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
        },
        googlepayorbital: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
        },
        googlepaycheckoutcom: {
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

export default connectFormik(GooglePayPaymentMethod);
