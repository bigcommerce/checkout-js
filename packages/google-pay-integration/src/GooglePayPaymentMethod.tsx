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
import { some } from 'lodash';
import React, { type FunctionComponent, useCallback, useRef } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import {
    type CheckoutButtonResolveId,
    PaymentMethodId,
    type PaymentMethodProps,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { WalletButtonPaymentMethodComponent } from '@bigcommerce/checkout/wallet-button-integration';

import GooglePayPaymentMethodComponent from './GooglePayPaymentMethodComponent';

const GooglePayPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    method,
    onUnhandledError,
    paymentForm,
    ...rest
}) => {
    const {
        checkoutState: {
            data: { getCheckout, getConfig },
        },
    } = useCheckout();

    const checkout = getCheckout();
    const isPaymentSelected = checkout ? some(checkout.payments, { providerId: method.id }) : false;

    // Capture whether Google Pay was already selected at mount time (express-entry
    // from PDP/Cart button). If payment becomes selected AFTER mount — during the
    // direct-pay sheet interaction — we must not switch branches; the SDK will
    // redirect to order confirmation without any intermediate UI change.
    const wasPaymentSelectedAtMountRef = useRef(isPaymentSelected);

    const features = getConfig()?.checkoutSettings.features ?? {};
    const isDirectPayEnabled = Boolean(features['PI-5111.google_pay_direct_pay_on_click'] ?? true);

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
    // Express-entry flow: GPay was selected via PDP/Cart/top-of-checkout button.
    // Payment data is already set — show the existing wallet UI (PaymentView + Place Order).
    if (wasPaymentSelectedAtMountRef.current) {
        return (
            <WalletButtonPaymentMethodComponent
                {...rest}
                buttonId="walletButton"
                deinitializePayment={checkoutService.deinitializePayment}
                initializePayment={initializeGooglePayPayment}
                method={method}
                paymentForm={paymentForm}
                shouldShowEditButton
                signOutCustomer={checkoutService.signOutCustomer}
            />
        );
    }

    // Accordion-selection flow (experiment on): replace the Place Order button with a
    // branded Google Pay button that opens the payment sheet and completes the order directly.
    if (isDirectPayEnabled) {
        return (
            <>
                <div>{/* direct pay enabled!!!!!! */}</div>
                <GooglePayPaymentMethodComponent
                    {...rest}
                    checkoutService={checkoutService}
                    method={method}
                    onUnhandledError={onUnhandledError}
                    paymentForm={paymentForm}
                />
            </>
        );
    }

    // Accordion-selection flow (experiment off): legacy wallet-button flow.
    return (
        <WalletButtonPaymentMethodComponent
            {...rest}
            buttonId="walletButton"
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={initializeGooglePayPayment}
            method={method}
            paymentForm={paymentForm}
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
