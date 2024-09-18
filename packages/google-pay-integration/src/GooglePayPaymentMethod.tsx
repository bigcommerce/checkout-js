import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback } from 'react';

import {
    CheckoutButtonResolveId,
    PaymentMethodId,
    PaymentMethodProps,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { WalletButtonPaymentMethodComponent } from '@bigcommerce/checkout/wallet-button-integration';

const GooglePayPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    method,
    onUnhandledError,
    ...rest
}) => {
    const initializeGooglePayPayment = useCallback(
        (defaultOptions: PaymentInitializeOptions) => {
            const reinitializePayment = async (options: PaymentInitializeOptions) => {
                try {
                    await checkoutService.deinitializePayment({
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });

                    await checkoutService.initializePayment({
                        ...options,
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });
                } catch (error) {
                    if (error instanceof Error) {
                        onUnhandledError(error);
                    }
                }
            };

            const mergedOptions = {
                ...defaultOptions,
                [PaymentMethodId.AdyenV2GooglePay]: {
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.AdyenV3GooglePay]: {
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.AuthorizeNetGooglePay]: {
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.BNZGooglePay]: {
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.BraintreeGooglePay]: {
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.PayPalCommerceGooglePay]: {
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.StripeGooglePay]: {
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.StripeUPEGooglePay]: {
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.CybersourceV2GooglePay]: {
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.OrbitalGooglePay]: {
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.CheckoutcomGooglePay]: {
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.WorldpayAccessGooglePay]: {
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.TdOnlineMartGooglePay]: {
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
            };

            return checkoutService.initializePayment(mergedOptions);
        },
        [checkoutService, method, onUnhandledError],
    );

    return (
        <WalletButtonPaymentMethodComponent
            {...rest}
            buttonId="walletButton"
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={initializeGooglePayPayment}
            method={method}
            shouldShowEditButton
            signOutCustomer={checkoutService.signOutCustomer}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, CheckoutButtonResolveId>(
    GooglePayPaymentMethod,
    [
        { id: PaymentMethodId.AdyenV2GooglePay },
        { id: PaymentMethodId.AdyenV3GooglePay },
        { id: PaymentMethodId.AuthorizeNetGooglePay },
        { id: PaymentMethodId.BNZGooglePay },
        { id: PaymentMethodId.BraintreeGooglePay },
        { id: PaymentMethodId.PayPalCommerceGooglePay },
        { id: PaymentMethodId.CheckoutcomGooglePay },
        { id: PaymentMethodId.CybersourceV2GooglePay },
        { id: PaymentMethodId.OrbitalGooglePay },
        { id: PaymentMethodId.StripeGooglePay },
        { id: PaymentMethodId.StripeUPEGooglePay },
        { id: PaymentMethodId.WorldpayAccessGooglePay },
        { id: PaymentMethodId.TdOnlineMartGooglePay },
    ],
);
