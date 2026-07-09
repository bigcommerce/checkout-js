import React, { type FunctionComponent } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';

import CheckoutButtonList from './CheckoutButtonList';

interface SignedInCustomerWalletButtonsProps {
    isPaymentStepActive: boolean;
    checkEmbeddedSupport?(methodIds: string[]): void;
    onUnhandledError?(error: Error): void;
    onWalletButtonClick?(methodName: string): void;
}

export const SignedInCustomerWalletButtons: FunctionComponent<
    SignedInCustomerWalletButtonsProps
> = ({ checkEmbeddedSupport, isPaymentStepActive, onUnhandledError, onWalletButtonClick }) => {
    const {
        checkoutService,
        selectedState: { customer, config, isPaymentDataRequired, isInitializingCustomer },
    } = useCheckout(({ data, statuses }) => ({
        customer: data.getCustomer(),
        config: data.getConfig(),
        isPaymentDataRequired: data.isPaymentDataRequired(),
        isInitializingCustomer: statuses.isInitializingCustomer(),
    }));

    if (!customer || !config) {
        return null;
    }

    const { checkoutSettings } = config;
    const isWalletButtonsOnTop = Boolean(
        checkoutSettings.checkoutUserExperienceSettings?.walletButtonsOnTop,
    );
    const requiresB2BToken = Boolean(checkoutSettings.capabilities?.userJourney.requiresB2BToken);

    const showWalletButtons =
        !customer.isGuest &&
        !isWalletButtonsOnTop &&
        !requiresB2BToken &&
        !isPaymentStepActive &&
        isPaymentDataRequired;

    if (!showWalletButtons) {
        return null;
    }

    return (
        <CheckoutButtonList
            checkEmbeddedSupport={checkEmbeddedSupport}
            deinitialize={checkoutService.deinitializeCustomer}
            initialize={checkoutService.initializeCustomer}
            isInitializing={isInitializingCustomer}
            methodIds={checkoutSettings.remoteCheckoutProviders}
            onClick={onWalletButtonClick}
            onError={onUnhandledError}
            wrapperClassName="signedInCustomerWalletButtons"
        />
    );
};
