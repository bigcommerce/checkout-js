import React, { lazy } from 'react';

import { useCheckout, useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { LazyContainer } from '@bigcommerce/checkout/ui';

import { retry } from '../../common/utility';
import {
    CheckoutSuggestion,
    CustomerInfo,
    type CustomerProps,
    type CustomerSignOutEvent,
    CustomerViewType,
} from '../../customer';
import { isEmbedded } from '../../embeddedCheckout';
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
    onWalletButtonClick,
}) => {
    const { themeV2 } = useThemeContext();
    const { selectedState } = useCheckout(
        ({
            data: { getConfig },
            statuses: { isContinuingAsGuest, isExecutingPaymentMethodCheckout },
        }) => ({
            config: getConfig(),
            isContinuingAsGuest: isContinuingAsGuest(),
            isExecutingPaymentMethodCheckout: isExecutingPaymentMethodCheckout(),
        }),
    );
    const { config, isContinuingAsGuest, isExecutingPaymentMethodCheckout } = selectedState;

    const handleShowLogin = () => {
        if (config?.checkoutSettings.shouldRedirectToStorefrontForAuth) {
            window.location.assign(
                `${config.links.loginLink}?redirectTo=${config.links.checkoutLink}`,
            );

            return;
        }

        onChangeViewType?.(CustomerViewType.Login);
    };

    const headerAction =
        themeV2 &&
        viewType === CustomerViewType.Guest &&
        !isContinuingAsGuest &&
        !isExecutingPaymentMethodCheckout ? (
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
                    onWalletButtonClick={onWalletButtonClick}
                    step={step}
                    viewType={viewType}
                />
            </LazyContainer>
        </CheckoutStep>
    );
};

export default CustomerStep;
