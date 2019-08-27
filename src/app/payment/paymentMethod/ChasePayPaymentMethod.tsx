import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import WalletButtonPaymentMethod, { WalletButtonPaymentMethodProps } from './WalletButtonPaymentMethod';

export type CCAvenueMarsPaymentMethodProps = Omit<WalletButtonPaymentMethodProps, 'buttonId' | 'shouldShowEditButton'>;

const ChasePayPaymentMethod: FunctionComponent<CCAvenueMarsPaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => {
    const initializeChasePayPayment = useCallback((options: PaymentInitializeOptions) => initializePayment({
        ...options,
        chasepay: {
            walletButton: 'walletButton',
        },
    }), [initializePayment]);

    return <WalletButtonPaymentMethod
        { ...rest }
        buttonId="walletButton"
        initializePayment={ initializeChasePayPayment }
        shouldShowEditButton
    />;
};

export default ChasePayPaymentMethod;
