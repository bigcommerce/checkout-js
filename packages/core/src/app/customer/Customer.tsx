import {
    type CustomerCredentials,
} from '@bigcommerce/checkout-sdk';
import { createBigCommercePaymentsFastlaneCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import { createBoltCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/bolt';
import { createBraintreeFastlaneCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/braintree';
import { createPayPalCommerceFastlaneCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/paypal-commerce';
import { createStripeLinkV2CustomerStrategy, createStripeUPECustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/stripe';
import { noop } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import { useAnalytics } from '@bigcommerce/checkout/contexts';

import type CheckoutStepStatus from '../checkout/CheckoutStepStatus';
import { isErrorWithType } from '../common/error';
import { PaymentMethodId } from '../payment/paymentMethod';

import CreateAccountForm from './CreateAccountForm';
import CustomerViewType from './CustomerViewType';
import EmailLoginForm, { type EmailLoginFormValues } from './EmailLoginForm';
import { type CreateAccountFormValues } from './getCreateCustomerValidationSchema';
import { type GuestFormValues } from './GuestForm';
import { GuestFormContainer } from './GuestFormContainer';
import LoginForm from './LoginForm';
import mapCreateAccountFromFormValues from './mapCreateAccountFromFormValues';
import { SubscribeSessionStorage } from './SubscribeSessionStorage';
import { useCustomer } from './useCustomer';

export interface CustomerProps {
    viewType: CustomerViewType;
    step: CheckoutStepStatus;
    isEmbedded?: boolean;
    isSubscribed: boolean;
    isWalletButtonsOnTop: boolean;
    checkEmbeddedSupport?(methodIds: string[]): void;
    onChangeViewType?(viewType: CustomerViewType): void;
    onAccountCreated?(): void;
    onContinueAsGuest?(): void;
    onContinueAsGuestError?(error: Error): void;
    onReady?(): void;
    onSubscribeToNewsletter(subscribe: boolean): void;
    onSignIn?(): void;
    onSignInError?(error: Error): void;
    onUnhandledError?(error: Error): void;
    onWalletButtonClick?(methodName: string): void;
}

export interface CustomerState {
    isEmailLoginFormOpen: boolean;
    isReady: boolean;
    hasRequestedLoginEmail: boolean;
    draftEmail?: string;
}

const Customer: React.FC<CustomerProps> = ({
    viewType,
    step,
    isEmbedded,
    isSubscribed,
    isWalletButtonsOnTop,
    onChangeViewType = noop,
    onAccountCreated = noop,
    onContinueAsGuest = noop,
    onContinueAsGuestError = noop,
    onReady = noop,
    onSubscribeToNewsletter,
    onSignIn = noop,
    onSignInError = noop,
    onUnhandledError = noop,
    onWalletButtonClick = noop,
}) => {
    const [state, setState] = useState<CustomerState>({
        isEmailLoginFormOpen: false,
        isReady: false,
        hasRequestedLoginEmail: false,
        draftEmail: undefined,
    });

    const { analyticsTracker } = useAnalytics();

    const customerData = useCustomer();

    // Initialize draftEmail on mount
    useEffect(() => {
        setState(prevState => ({
            ...prevState,
            draftEmail: customerData.data.email,
        }));
    }, [customerData.data.email]);

    // componentDidMount equivalent
    useEffect(() => {
        const initializeCustomer = async () => {
            try {
                if (customerData.data.providerWithCustomCheckout && 
                    customerData.data.providerWithCustomCheckout !== PaymentMethodId.StripeUPE) {
                    // TODO: Split out into separate chunks so they can be lazy loaded
                    await customerData.actions.initializeCustomer({
                        methodId: customerData.data.providerWithCustomCheckout,
                        integrations: [
                            createBigCommercePaymentsFastlaneCustomerStrategy,
                            createBraintreeFastlaneCustomerStrategy,
                            createPayPalCommerceFastlaneCustomerStrategy,
                            createBoltCustomerStrategy,
                            createStripeUPECustomerStrategy,
                            createStripeLinkV2CustomerStrategy,
                        ],
                    });
                }
            } catch (error) {
                onUnhandledError(error);
            }

            setState(prevState => ({ ...prevState, isReady: true }));
            onReady();
        };

        initializeCustomer();
    }, []);

    // componentWillUnmount equivalent
    useEffect(() => {
        return () => {
            const cleanup = async () => {
                try {
                    await customerData.actions.deinitializeCustomer({ 
                        methodId: customerData.data.providerWithCustomCheckout 
                    });
                } catch (error) {
                    onUnhandledError(error);
                }
            };

            void cleanup();
        };
    }, [customerData.actions.deinitializeCustomer, customerData.data.providerWithCustomCheckout, onUnhandledError]);

    // Event handlers converted to useCallback
    const handleChangeEmail = useCallback((email: string) => {
        setState(prevState => ({ ...prevState, draftEmail: email }));
        analyticsTracker.customerEmailEntry(email);
    }, [analyticsTracker]);

    const handleSignIn = useCallback(async (credentials: CustomerCredentials) => {
        try {
            await customerData.actions.signIn(credentials);
            onSignIn();
            setState(prevState => ({ ...prevState, draftEmail: undefined }));
        } catch (error) {
            onSignInError(error);
        }
    }, [customerData.actions.signIn, onSignIn, onSignInError]);

    const handleContinueAsGuest = useCallback(async (formValues: GuestFormValues) => {
        const email = formValues.email.trim();
        const updateSubscriptionWhenUnchecked =
            customerData.data.hasBillingId || customerData.data.defaultShouldSubscribe ? false : undefined;

        try {
            const { data } = await customerData.actions.continueAsGuest({
                email,
                acceptsMarketingNewsletter:
                    customerData.data.canSubscribe && formValues.shouldSubscribe
                        ? true
                        : updateSubscriptionWhenUnchecked,
                acceptsAbandonedCartEmails: formValues.shouldSubscribe
                    ? true
                    : updateSubscriptionWhenUnchecked,
            });

            onSubscribeToNewsletter(formValues.shouldSubscribe);

            SubscribeSessionStorage.setSubscribeStatus(formValues.shouldSubscribe);

            const customer = data.getCustomer();
            const paymentProviderCustomer = data.getPaymentProviderCustomer();

            if (customer && customer.shouldEncourageSignIn && customer.isGuest && !paymentProviderCustomer?.stripeLinkAuthenticationState) {
                return onChangeViewType(CustomerViewType.SuggestedLogin);
            }

            await executePaymentMethodCheckoutOrContinue();

            setState(prevState => ({ ...prevState, draftEmail: undefined }));
        } catch (error) {
            if (
                isErrorWithType(error) &&
                (error.type === 'update_subscriptions' ||
                    error.type === 'payment_method_client_invalid')
            ) {
                setState(prevState => ({ ...prevState, draftEmail: undefined }));
                onContinueAsGuest();
            }

            if (isErrorWithType(error) && error.type === 'empty_cart') {
                return onContinueAsGuestError(error);
            }

            if (isErrorWithType(error) && error.status === 429) {
                return onChangeViewType(CustomerViewType.EnforcedLogin);
            }

            if (isErrorWithType(error) && error.status === 403) {
                return onChangeViewType(CustomerViewType.CancellableEnforcedLogin);
            }

            onContinueAsGuestError(error);
        }
    }, [customerData, onSubscribeToNewsletter, onChangeViewType, onContinueAsGuest, onContinueAsGuestError]);

    const executePaymentMethodCheckoutOrContinue = useCallback(async () => {
        if (customerData.data.providerWithCustomCheckout && 
            customerData.data.providerWithCustomCheckout !== PaymentMethodId.StripeUPE) {
            await customerData.actions.executePaymentMethodCheckout({
                methodId: customerData.data.providerWithCustomCheckout,
                continueWithCheckoutCallback: onContinueAsGuest,
                checkoutPaymentMethodExecuted: (payload) => {
                    analyticsTracker.customerPaymentMethodExecuted(payload);
                }
            });
        } else {
            onContinueAsGuest();
        }
    }, [customerData.actions.executePaymentMethodCheckout, customerData.data.providerWithCustomCheckout, onContinueAsGuest, analyticsTracker]);

    // Additional event handlers
    const handleShowLogin = useCallback(() => {
        onChangeViewType(CustomerViewType.Login);
    }, [onChangeViewType]);

    const handleCreateAccount = useCallback(async (values: CreateAccountFormValues) => {
        await customerData.actions.createAccount(mapCreateAccountFromFormValues(values));
        onAccountCreated();
    }, [customerData.actions.createAccount, onAccountCreated]);

    const handleCancelCreateAccount = useCallback(() => {
        if (customerData.data.createAccountError) {
            customerData.actions.clearError(customerData.data.createAccountError);
        }

        onChangeViewType(CustomerViewType.Login);
    }, [customerData.actions.clearError, customerData.data.createAccountError, onChangeViewType]);

    const handleCancelSignIn = useCallback(() => {
        if (customerData.data.signInError) {
            customerData.actions.clearError(customerData.data.signInError);
        }

        onChangeViewType(CustomerViewType.Guest);
    }, [customerData.actions.clearError, customerData.data.signInError, onChangeViewType]);

    const showCreateAccount = useCallback(() => {
        onChangeViewType(CustomerViewType.CreateAccount);
    }, [onChangeViewType]);

    const handleSendLoginEmail = useCallback(async (values: EmailLoginFormValues) => {
        try {
            await customerData.actions.sendLoginEmail(values);
        } catch {
            // Need to write catch block since one test covers the case when `sendLoginEmail` fails
        } finally {
            setState(prevState => ({ ...prevState, hasRequestedLoginEmail: true }));
        }
    }, [customerData.actions.sendLoginEmail]);

    const handleEmailLoginClicked = useCallback(async () => {
        try {
            if (viewType !== CustomerViewType.Login && state.draftEmail) {
                await handleSendLoginEmail({ email: state.draftEmail });
            }
        } finally {
            setState(prevState => ({ ...prevState, isEmailLoginFormOpen: true }));
        }
    }, [viewType, state.draftEmail, handleSendLoginEmail]);

    const closeEmailLoginFormForm = useCallback(() => {
        setState(prevState => ({
            ...prevState,
            isEmailLoginFormOpen: false,
            hasRequestedLoginEmail: false,
        }));
    }, []);

    // Main render logic
    const shouldRenderGuestForm = viewType === CustomerViewType.Guest;
    const shouldRenderCreateAccountForm = viewType === CustomerViewType.CreateAccount;
    const shouldRenderLoginForm = !shouldRenderGuestForm && !shouldRenderCreateAccountForm;

    if (!state.isReady) {
        return null;
    }

    return (
        <>
            {state.isEmailLoginFormOpen && (
                <EmailLoginForm
                    email={state.draftEmail}
                    emailHasBeenRequested={state.hasRequestedLoginEmail}
                    isFloatingLabelEnabled={customerData.data.isFloatingLabelEnabled}
                    isOpen={state.isEmailLoginFormOpen}
                    isSendingEmail={customerData.data.isSendingSignInEmail}
                    onRequestClose={closeEmailLoginFormForm}
                    onSendLoginEmail={handleSendLoginEmail}
                    sentEmail={customerData.data.signInEmail}
                    sentEmailError={customerData.data.signInEmailError}
                />
            )}
            
            {shouldRenderLoginForm && (
                <LoginForm
                    continueAsGuestButtonLabelId="customer.continue_as_guest_action"
                    email={state.draftEmail || customerData.data.email}
                    isEmbedded={isEmbedded}
                    isFloatingLabelEnabled={customerData.data.isFloatingLabelEnabled}
                    onCancel={handleCancelSignIn}
                    onChangeEmail={handleChangeEmail}
                    onContinueAsGuest={executePaymentMethodCheckoutOrContinue}
                    onCreateAccount={showCreateAccount}
                    onSendLoginEmail={handleEmailLoginClicked}
                    onSignIn={handleSignIn}
                    signInError={customerData.data.signInError}
                    viewType={viewType}
                />
            )}
            
            {shouldRenderGuestForm && (
                <GuestFormContainer
                    email={state.draftEmail || customerData.data.email}
                    handleChangeEmail={handleChangeEmail}
                    handleContinueAsGuest={handleContinueAsGuest}
                    handleShowLogin={handleShowLogin}
                    isFloatingLabelEnabled={customerData.data.isFloatingLabelEnabled}
                    isSubscribed={isSubscribed}
                    isWalletButtonsOnTop={isWalletButtonsOnTop}
                    onUnhandledError={onUnhandledError}
                    onWalletButtonClick={onWalletButtonClick}
                    step={step}
                />
            )}
            
            {shouldRenderCreateAccountForm && (
                <CreateAccountForm
                    createAccountError={customerData.data.createAccountError}
                    defaultShouldSubscribe={customerData.data.defaultShouldSubscribe}
                    formFields={customerData.data.customerAccountFields}
                    isCreatingAccount={customerData.data.isCreatingAccount}
                    isExecutingPaymentMethodCheckout={customerData.data.isExecutingPaymentMethodCheckout}
                    isFloatingLabelEnabled={customerData.data.isFloatingLabelEnabled}
                    onCancel={handleCancelCreateAccount}
                    onSubmit={handleCreateAccount}
                    requiresMarketingConsent={customerData.data.requiresMarketingConsent}
                />
            )}
        </>
    );
};

export default Customer;
