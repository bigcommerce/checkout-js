import React, { lazy } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { LazyContainer } from '@bigcommerce/checkout/ui';

import { retry } from '../../common/utility';
import {
    CheckoutSuggestion,
    CustomerInfo,
    type CustomerProps,
    type CustomerSignOutEvent,
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
    return (
        <CheckoutStep
            {...step}
            heading={<TranslatedString id="customer.customer_heading" />}
            key={step.type}
            onEdit={onEdit}
            onExpanded={onExpanded}
            suggestion={<CheckoutSuggestion />}
            summary={
                <CustomerInfo
                    onSignOut={onSignOut}
                    onSignOutError={onSignOutError}
                />
            }
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
