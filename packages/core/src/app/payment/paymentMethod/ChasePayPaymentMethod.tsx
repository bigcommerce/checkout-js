import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback } from 'react';
import { Omit } from 'utility-types';

import WalletButtonPaymentMethod, {
    WalletButtonPaymentMethodProps,
} from './WalletButtonPaymentMethod';

export type CCAvenueMarsPaymentMethodProps = Omit<
    WalletButtonPaymentMethodProps,
    'buttonId' | 'shouldShowEditButton'
>;

const ChasePayPaymentMethod: FunctionComponent<CCAvenueMarsPaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => {
    const initializeChasePayPayment = useCallback(
        (options: PaymentInitializeOptions) =>
            initializePayment({
                ...options,
                chasepay: {
                    walletButton: 'chaseWalletButton',
                },
            }),
        [initializePayment],
    );

    return (
        <WalletButtonPaymentMethod
            {...rest}
            buttonId="chaseWalletButton"
            initializePayment={initializeChasePayPayment}
            shouldShowEditButton
        />
    );
};

export default ChasePayPaymentMethod;
