import React, { FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import WalletButtonPaymentMethod, { WalletButtonPaymentMethodProps } from './WalletButtonPaymentMethod';

export type CCAvenueMarsPaymentMethodProps = Omit<WalletButtonPaymentMethodProps, 'buttonId' | 'shouldShowEditButton'>;

const ChasePayPaymentMethod: FunctionComponent<CCAvenueMarsPaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => (
    <WalletButtonPaymentMethod
        { ...rest }
        buttonId="walletButton"
        initializePayment={ options => initializePayment({
            ...options,
            chasepay: {
                walletButton: 'walletButton',
            },
        }) }
        shouldShowEditButton
    />
);

export default ChasePayPaymentMethod;
