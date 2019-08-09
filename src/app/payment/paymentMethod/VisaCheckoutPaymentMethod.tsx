import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import WalletButtonPaymentMethod, { WalletButtonPaymentMethodProps } from './WalletButtonPaymentMethod';

export type VisaCheckoutPaymentMethodProps = Omit<WalletButtonPaymentMethodProps, 'buttonId' | 'editButtonClassName' | 'shouldShowEditButton' | 'signInButtonClassName'>;

const VisaCheckoutPaymentMethod: FunctionComponent<VisaCheckoutPaymentMethodProps> = ({
    deinitializePayment,
    initializePayment,
    method,
    onUnhandledError = noop,
    ...rest
}) => {
    const reinitializePayment = async (options: PaymentInitializeOptions) => {
        try {
            await deinitializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });

            await initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
                ...options,
            });
        } catch (error) {
            onUnhandledError(error);
        }
    };

    return (
        <WalletButtonPaymentMethod
            { ...rest }
            buttonId="walletButton"
            deinitializePayment={ deinitializePayment }
            editButtonClassName="v-button"
            method={ method }
            initializePayment={ defaultOptions => {
                const options = {
                    ...defaultOptions,
                    braintreevisacheckout: {
                        onError: onUnhandledError,
                        onPaymentSelect: () => reinitializePayment(options),
                    },
                };

                return initializePayment(options);
            } }
            shouldShowEditButton
            signInButtonClassName="v-button"
        />
    );
};

export default VisaCheckoutPaymentMethod;
