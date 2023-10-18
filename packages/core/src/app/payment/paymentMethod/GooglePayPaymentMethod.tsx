import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { FunctionComponent, useCallback } from 'react';
import { Omit } from 'utility-types';

import WalletButtonPaymentMethod, {
    WalletButtonPaymentMethodProps,
} from './WalletButtonPaymentMethod';

export type GooglePayPaymentMethodProps = Omit<
    WalletButtonPaymentMethodProps,
    'buttonId' | 'shouldShowEditButton'
>;

const GooglePayPaymentMethod: FunctionComponent<GooglePayPaymentMethodProps> = ({
    deinitializePayment,
    initializePayment,
    method,
    onUnhandledError = noop,
    ...rest
}) => {
    const initializeGooglePayPayment = useCallback(
        (defaultOptions: PaymentInitializeOptions) => {
            const reinitializePayment = async (options: PaymentInitializeOptions) => {
                try {
                    await deinitializePayment({
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });

                    await initializePayment({
                        ...options,
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });
                } catch (error) {
                    onUnhandledError(error);
                }
            };

        const mergedOptions = {
          ...defaultOptions,
          googlepayadyenv2: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
            onPaymentSelect: () => reinitializePayment(mergedOptions),
          },
          googlepayadyenv3: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
            onPaymentSelect: () => reinitializePayment(mergedOptions),
          },
          googlepayauthorizenet: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
            onPaymentSelect: () => reinitializePayment(mergedOptions),
          },
          googlepaybnz: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
            onPaymentSelect: () => reinitializePayment(mergedOptions),
          },
          googlepaybraintree: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
            onPaymentSelect: () => reinitializePayment(mergedOptions),
          },
          googlepaypaypalcommerce: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
            onPaymentSelect: () => reinitializePayment(mergedOptions),
          },
          googlepaystripe: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
            onPaymentSelect: () => reinitializePayment(mergedOptions),
          },
          googlepaystripeupe: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
            onPaymentSelect: () => reinitializePayment(mergedOptions),
          },
          googlepaycybersourcev2: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
            onPaymentSelect: () => reinitializePayment(mergedOptions),
          },
          googlepayorbital: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
            onPaymentSelect: () => reinitializePayment(mergedOptions),
          },
          googlepaycheckoutcom: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
            onPaymentSelect: () => reinitializePayment(mergedOptions),
          },
          googlepayworldpayaccess: {
            walletButton: 'walletButton',
            onError: onUnhandledError,
            onPaymentSelect: () => reinitializePayment(mergedOptions),
          },
        };

            return initializePayment(mergedOptions);
        },
        [deinitializePayment, initializePayment, method, onUnhandledError],
    );

    return (
        <WalletButtonPaymentMethod
            {...rest}
            buttonId="walletButton"
            deinitializePayment={deinitializePayment}
            initializePayment={initializeGooglePayPayment}
            method={method}
            shouldShowEditButton
        />
    );
};

export default GooglePayPaymentMethod;
