import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import {
    createGooglePayAdyenV2PaymentStrategy,
    createGooglePayAdyenV3PaymentStrategy,
    createGooglePayAuthorizeNetPaymentStrategy,
    createGooglePayBigCommercePaymentsPaymentStrategy,
    createGooglePayBraintreePaymentStrategy,
    createGooglePayCheckoutComPaymentStrategy,
    createGooglePayCybersourcePaymentStrategy,
    createGooglePayOrbitalPaymentStrategy,
    createGooglePayPPCPPaymentStrategy,
    createGooglePayStripePaymentStrategy,
    createGooglePayTdOnlineMartPaymentStrategy,
    createGooglePayWorldpayAccessPaymentStrategy,
} from '@bigcommerce/checkout-sdk/integrations/google-pay';
import React, { type FunctionComponent, useCallback } from 'react';

import {
    type CheckoutButtonResolveId,
    PaymentMethodId,
    type PaymentMethodProps,
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

            const loadingContainerId = 'checkout-app';
            const mergedOptions: PaymentInitializeOptions = {
                ...defaultOptions,
                integrations: [
                    createGooglePayAdyenV2PaymentStrategy,
                    createGooglePayAdyenV3PaymentStrategy,
                    createGooglePayAuthorizeNetPaymentStrategy,
                    createGooglePayCheckoutComPaymentStrategy,
                    createGooglePayCybersourcePaymentStrategy,
                    createGooglePayOrbitalPaymentStrategy,
                    createGooglePayStripePaymentStrategy,
                    createGooglePayWorldpayAccessPaymentStrategy,
                    createGooglePayBraintreePaymentStrategy,
                    createGooglePayPPCPPaymentStrategy,
                    createGooglePayBigCommercePaymentsPaymentStrategy,
                    createGooglePayTdOnlineMartPaymentStrategy,
                ],
                [PaymentMethodId.AdyenV2GooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.AdyenV3GooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.AuthorizeNetGooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.BNZGooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.BigCommercePaymentsGooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.BraintreeGooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.PayPalCommerceGooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.StripeGooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.StripeUPEGooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.CybersourceV2GooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.OrbitalGooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.CheckoutcomGooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.WorldpayAccessGooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.TdOnlineMartGooglePay]: {
                    loadingContainerId,
                    walletButton: 'walletButton',
                    onError: onUnhandledError,
                    onPaymentSelect: () => reinitializePayment(mergedOptions),
                },
                [PaymentMethodId.StripeOCSGooglePay]: {
                    loadingContainerId,
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
        { id: PaymentMethodId.BigCommercePaymentsGooglePay },
        { id: PaymentMethodId.CheckoutcomGooglePay },
        { id: PaymentMethodId.CybersourceV2GooglePay },
        { id: PaymentMethodId.OrbitalGooglePay },
        { id: PaymentMethodId.StripeGooglePay },
        { id: PaymentMethodId.StripeUPEGooglePay },
        { id: PaymentMethodId.WorldpayAccessGooglePay },
        { id: PaymentMethodId.TdOnlineMartGooglePay },
        { id: PaymentMethodId.StripeOCSGooglePay },
    ],
);
