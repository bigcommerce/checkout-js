import { createBraintreeFastlaneCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/braintree';
import React, { lazy, useEffect } from 'react';

import { useCheckout, useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { LazyContainer } from '@bigcommerce/checkout/ui';

import { retry } from '../../common/utility';
import {
    CheckoutSuggestion,
    CustomerInfo,
    type CustomerProps,
    type CustomerSignOutEvent,
    CustomerViewType,
} from '../../customer';
import { attemptStorefrontLoginRedirect } from '../../customer/attemptStorefrontLoginRedirect';
import { isEmbedded } from '../../embeddedCheckout';
import getProviderWithCustomCheckout from '../../payment/getProviderWithCustomCheckout';
import CheckoutStep from '../CheckoutStep';
import type CheckoutStepType from '../CheckoutStepType';

const Customer = lazy(() =>
    retry(
        () =>
            import(
                /* webpackChunkName: "customer" */
                '../../customer/Customer'
            ),
    ),
);

export interface CustomerStepProps extends CustomerProps {
    onEdit(type: CheckoutStepType): void;
    onExpanded(type: CheckoutStepType): void;
    onSignOut(event: CustomerSignOutEvent): void;
    onSignOutError(error: Error): void;
}

const CustomerStep: React.FC<CustomerStepProps> = ({
    step,
    viewType,
    isSubscribed,
    isWalletButtonsOnTop,
    onEdit,
    onExpanded,
    onSignOut,
    onSignOutError,
    checkEmbeddedSupport,
    onAccountCreated,
    onChangeViewType,
    onContinueAsGuest,
    onContinueAsGuestError,
    onReady,
    onSignIn,
    onSignInError,
    onSubscribeToNewsletter,
    onUnhandledError,
}) => {
    const { enhancedThemeV1 } = useThemeContext();
    const {
        checkoutService,
        errorLogger,
        selectedState: {
            config,
            customer,
            isContinuingAsGuest,
            isExecutingPaymentMethodCheckout,
            isInitializingCustomer,
        },
    } = useCheckout(({ data, statuses }) => ({
        config: data.getConfig(),
        customer: data.getCustomer(),
        isContinuingAsGuest: statuses.isContinuingAsGuest(),
        isExecutingPaymentMethodCheckout: statuses.isExecutingPaymentMethodCheckout(),
        isInitializingCustomer: statuses.isInitializingCustomer(),
    }));

    const { isFastlaneForKnownShoppersEnabled } = usePayPalFastlaneAddress();
    const providerWithCustomCheckout = getProviderWithCustomCheckout(
        config?.checkoutSettings.providerWithCustomCheckout,
    );
    const shouldInitializeBraintreeFastlaneForKnownShopper =
        isFastlaneForKnownShoppersEnabled && !!customer && !customer.isGuest;

    // Info: the Customer component (where customer strategies are normally initialized) is mounted
    // only while the customer step is active, which never happens for logged in shoppers.
    // So the Braintree Fastlane customer strategy is initialized here for known shoppers.
    useEffect(() => {
        if (!shouldInitializeBraintreeFastlaneForKnownShopper || !providerWithCustomCheckout) {
            return;
        }

        checkoutService
            .initializeCustomer({
                methodId: providerWithCustomCheckout,
                integrations: [createBraintreeFastlaneCustomerStrategy],
                onErrorLog: (error: unknown) => {
                    errorLogger?.log(error instanceof Error ? error : new Error(String(error)));
                },
            })
            .catch(onUnhandledError);
    }, [shouldInitializeBraintreeFastlaneForKnownShopper, providerWithCustomCheckout]);

    const handleShowLogin = () => {
        if (attemptStorefrontLoginRedirect(config)) {
            return;
        }

        onChangeViewType?.(CustomerViewType.Login);
    };

    const isCustomerBusy =
        isContinuingAsGuest || isExecutingPaymentMethodCheckout || isInitializingCustomer;
    const shouldShowHeaderAction =
        enhancedThemeV1 && viewType === CustomerViewType.Guest && !isCustomerBusy;

    const headerAction = shouldShowHeaderAction ? (
        <span className="body-regular">
            <TranslatedString id="customer.login_text" />{' '}
            <a
                data-test="customer-continue-button"
                id="checkout-customer-login"
                onClick={handleShowLogin}
                role="button"
                tabIndex={0}
            >
                <TranslatedString id="customer.login_action" />
            </a>
        </span>
    ) : null;

    return (
        <CheckoutStep
            {...step}
            headerAction={headerAction}
            heading={<TranslatedString id="customer.customer_heading" />}
            key={step.type}
            onEdit={onEdit}
            onExpanded={onExpanded}
            suggestion={<CheckoutSuggestion />}
            summary={<CustomerInfo onSignOut={onSignOut} onSignOutError={onSignOutError} />}
        >
            <LazyContainer>
                <Customer
                    checkEmbeddedSupport={checkEmbeddedSupport}
                    isEmbedded={isEmbedded()}
                    isSubscribed={isSubscribed}
                    isWalletButtonsOnTop={isWalletButtonsOnTop}
                    onAccountCreated={onAccountCreated}
                    onChangeViewType={onChangeViewType}
                    onContinueAsGuest={onContinueAsGuest}
                    onContinueAsGuestError={onContinueAsGuestError}
                    onReady={onReady}
                    onSignIn={onSignIn}
                    onSignInError={onSignInError}
                    onSubscribeToNewsletter={onSubscribeToNewsletter}
                    onUnhandledError={onUnhandledError}
                    step={step}
                    viewType={viewType}
                />
            </LazyContainer>
        </CheckoutStep>
    );
};

export default CustomerStep;
