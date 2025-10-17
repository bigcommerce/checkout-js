import { type Cart } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { shouldUseStripeLinkByMinimumAmount } from '@bigcommerce/checkout/instrument-utils';
import { PaymentMethodId, useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { isPayPalFastlaneMethod } from '@bigcommerce/checkout/paypal-fastlane-integration';

import type CheckoutStepStatus from '../checkout/CheckoutStepStatus';
import getProviderWithCustomCheckout from '../payment/getProviderWithCustomCheckout';

import CheckoutButtonList from './CheckoutButtonList';
import GuestForm, { type GuestFormValues } from './GuestForm';
import StripeGuestForm from './StripeGuestForm';

interface GuestFormContainerProps {
    email?: string;
    isFloatingLabelEnabled?: boolean;
    isWalletButtonsOnTop: boolean;
    isSubscribed: boolean;
    step: CheckoutStepStatus;
    checkEmbeddedSupport?(methodIds: string[]): void;
    handleChangeEmail(email: string): void;
    handleContinueAsGuest(formValues: GuestFormValues): void;
    handleShowLogin(): void;
    onWalletButtonClick?(methodName: string): void;
    onUnhandledError?(error: Error): void;
}

function shouldRenderStripeForm(cart: Cart, providerWithCustomCheckout?: string) {
    return providerWithCustomCheckout === PaymentMethodId.StripeUPE
        && shouldUseStripeLinkByMinimumAmount(cart)
}

export const GuestFormContainer: React.FC<GuestFormContainerProps> = ({
    email,
    isFloatingLabelEnabled,
    isWalletButtonsOnTop,
    isSubscribed,
    step,
    checkEmbeddedSupport,
    handleChangeEmail,
    handleContinueAsGuest,
    handleShowLogin,
    onWalletButtonClick,
    onUnhandledError,
}) => {
    const { checkoutState, checkoutService } = useCheckout();
    const {
        data: {
            isPaymentDataRequired,
            getConfig,
            getCart,
        },
        statuses: {
            isInitializingCustomer,
            isContinuingAsGuest,
            isExecutingPaymentMethodCheckout
        },
    } = checkoutState;

    const {
        deinitializeCustomer,
        initializeCustomer,
    }  = checkoutService;

    const config = getConfig();
    const cart = getCart();
    const isLoadingGuestForm = isContinuingAsGuest() || isExecutingPaymentMethodCheckout();

    if (!config || !cart) {
        return null;
    }

    const {
        checkoutSettings: {
            privacyPolicyUrl,
            requiresMarketingConsent,
            remoteCheckoutProviders: checkoutButtonIds,
            providerWithCustomCheckout,
            isExpressPrivacyPolicy,
        },
        shopperConfig: {
            showNewsletterSignup: canSubscribe,
        },
    } = config;

    const customCheckoutProvider = getProviderWithCustomCheckout(providerWithCustomCheckout);
    
    const checkoutButtons = isWalletButtonsOnTop || !isPaymentDataRequired()
        ? null
        : <CheckoutButtonList
            checkEmbeddedSupport={checkEmbeddedSupport}
            deinitialize={deinitializeCustomer}
            initialize={initializeCustomer}
            isInitializing={isInitializingCustomer()}
            methodIds={checkoutButtonIds}
            onClick={onWalletButtonClick}
            onError={onUnhandledError}
        />;

    if (shouldRenderStripeForm(cart, customCheckoutProvider)) {
        return <StripeGuestForm
            canSubscribe={canSubscribe}
            checkoutButtons={checkoutButtons}
            continueAsGuestButtonLabelId="customer.continue"
            defaultShouldSubscribe={isSubscribed}
            deinitialize={deinitializeCustomer}
            email={email}
            initialize={initializeCustomer}
            isExpressPrivacyPolicy={isExpressPrivacyPolicy}
            isLoading={isContinuingAsGuest() || isInitializingCustomer() || isExecutingPaymentMethodCheckout()}
            onChangeEmail={handleChangeEmail}
            onContinueAsGuest={handleContinueAsGuest}
            onShowLogin={handleShowLogin}
            privacyPolicyUrl={privacyPolicyUrl}
            requiresMarketingConsent={requiresMarketingConsent}
            step={step}
        />;
    }
    
    return <GuestForm
        canSubscribe={canSubscribe}
        checkoutButtons={checkoutButtons}
        continueAsGuestButtonLabelId="customer.continue"
        defaultShouldSubscribe={isSubscribed}
        email={email}
        isExpressPrivacyPolicy={isExpressPrivacyPolicy}
        isFloatingLabelEnabled={isFloatingLabelEnabled}
        isLoading={isLoadingGuestForm}
        onChangeEmail={handleChangeEmail}
        onContinueAsGuest={handleContinueAsGuest}
        onShowLogin={handleShowLogin}
        privacyPolicyUrl={privacyPolicyUrl}
        requiresMarketingConsent={requiresMarketingConsent}
        shouldShowEmailWatermark={isPayPalFastlaneMethod(customCheckoutProvider)}
    />
};
