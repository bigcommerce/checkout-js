import {
    CheckoutPaymentMethodExecutedOptions,
    CheckoutSelectors,
    CustomerAccountRequestBody,
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
    FormField,
    GuestCredentials,
    SignInEmail,
    StoreConfig,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { AnalyticsContextProps } from '@bigcommerce/checkout/analytics';
import { CustomerSkeleton } from '@bigcommerce/checkout/ui';

import { withAnalytics } from '../analytics';
import { CheckoutContextProps, withCheckout } from '../checkout';
import CheckoutStepStatus from '../checkout/CheckoutStepStatus';
import { isErrorWithType } from '../common/error';
import { isFloatingLabelEnabled } from '../common/utility';
import { PaymentMethodId } from '../payment/paymentMethod';

import CheckoutButtonList from './CheckoutButtonList';
import CreateAccountForm from './CreateAccountForm';
import CustomerViewType from './CustomerViewType';
import EmailLoginForm, { EmailLoginFormValues } from './EmailLoginForm';
import { CreateAccountFormValues } from './getCreateCustomerValidationSchema';
import GuestForm, { GuestFormValues } from './GuestForm';
import LoginForm from './LoginForm';
import mapCreateAccountFromFormValues from './mapCreateAccountFromFormValues';
import StripeGuestForm from './StripeGuestForm';

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
}

export interface WithCheckoutCustomerProps {
    canSubscribe: boolean;
    customerAccountFields: FormField[];
    checkoutButtonIds: string[];
    defaultShouldSubscribe: boolean;
    email?: string;
    firstName?: string;
    forgotPasswordUrl: string;
    isContinuingAsGuest: boolean;
    isCreatingAccount: boolean;
    isExecutingPaymentMethodCheckout: boolean;
    isGuestEnabled: boolean;
    hasBillingId: boolean;
    isInitializing: boolean;
    isSendingSignInEmail: boolean;
    isSignInEmailEnabled: boolean;
    isSigningIn: boolean;
    privacyPolicyUrl?: string;
    providerWithCustomCheckout?: string;
    requiresMarketingConsent: boolean;
    signInEmail?: SignInEmail;
    signInEmailError?: Error;
    isAccountCreationEnabled: boolean;
    createAccountError?: Error;
    signInError?: Error;
    isFloatingLabelEnabled?: boolean;
    clearError(error: Error): Promise<CheckoutSelectors>;
    continueAsGuest(credentials: GuestCredentials): Promise<CheckoutSelectors>;
    deinitializeCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    executePaymentMethodCheckout(
        options: ExecutePaymentMethodCheckoutOptions,
    ): Promise<CheckoutSelectors>;
    initializeCustomer(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    sendLoginEmail(params: { email: string }): Promise<CheckoutSelectors>;
    signIn(credentials: CustomerCredentials): Promise<CheckoutSelectors>;
    createAccount(values: CustomerAccountRequestBody): Promise<CheckoutSelectors>;
}

export interface CustomerState {
    isEmailLoginFormOpen: boolean;
    isReady: boolean;
    hasRequestedLoginEmail: boolean;
}

class Customer extends Component<CustomerProps & WithCheckoutCustomerProps & AnalyticsContextProps, CustomerState> {
    state: CustomerState = {
        isEmailLoginFormOpen: false,
        isReady: false,
        hasRequestedLoginEmail: false,
    };

    private draftEmail?: string;

    async componentDidMount(): Promise<void> {
        const {
            initializeCustomer,
            email,
            onReady = noop,
            onUnhandledError = noop,
            providerWithCustomCheckout,
        } = this.props;

        this.draftEmail = email;

        try {
            if (providerWithCustomCheckout && providerWithCustomCheckout !== PaymentMethodId.StripeUPE) {
                await initializeCustomer({methodId: providerWithCustomCheckout});
            }
        } catch (error) {
            onUnhandledError(error);
        }

        this.setState({ isReady: true });

        onReady();
    }

    async componentWillUnmount(): Promise<void> {
        const {
            deinitializeCustomer = noop,
            providerWithCustomCheckout,
            onUnhandledError = noop,
        } = this.props;

        try {
            await deinitializeCustomer({ methodId: providerWithCustomCheckout });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    render(): ReactNode {
        const { viewType } = this.props;
        const { isEmailLoginFormOpen, isReady } = this.state;
        const shouldRenderGuestForm = viewType === CustomerViewType.Guest;
        const shouldRenderCreateAccountForm = viewType === CustomerViewType.CreateAccount;
        const shouldRenderLoginForm = !shouldRenderGuestForm && !shouldRenderCreateAccountForm;

        return (
            <CustomerSkeleton isLoading={!isReady}>
                {isEmailLoginFormOpen && this.renderEmailLoginLinkForm()}
                {shouldRenderLoginForm && this.renderLoginForm()}
                {shouldRenderGuestForm && this.renderGuestForm()}
                {shouldRenderCreateAccountForm && this.renderCreateAccountForm()}
            </CustomerSkeleton>
        );
    }

    private renderGuestForm(): ReactNode {
        const {
            canSubscribe,
            checkEmbeddedSupport,
            checkoutButtonIds,
            deinitializeCustomer,
            email,
            initializeCustomer,
            isContinuingAsGuest = false,
            isExecutingPaymentMethodCheckout = false,
            isInitializing = false,
            isSubscribed,
            isWalletButtonsOnTop,
            privacyPolicyUrl,
            requiresMarketingConsent,
            providerWithCustomCheckout,
            onUnhandledError = noop,
            step,
            isFloatingLabelEnabled,
        } = this.props;
        const checkoutButtons = isWalletButtonsOnTop
          ? null
          : <CheckoutButtonList
            checkEmbeddedSupport={checkEmbeddedSupport}
            deinitialize={deinitializeCustomer}
            initialize={initializeCustomer}
            isInitializing={isInitializing}
            methodIds={checkoutButtonIds}
            onError={onUnhandledError}
          />;

        const isLoadingGuestForm = isWalletButtonsOnTop ?
            isContinuingAsGuest :
            isContinuingAsGuest || isInitializing || isExecutingPaymentMethodCheckout;

        return (
            providerWithCustomCheckout === PaymentMethodId.StripeUPE ?
                <StripeGuestForm
                    canSubscribe={canSubscribe}
                    checkoutButtons={checkoutButtons}
                    continueAsGuestButtonLabelId="customer.continue"
                    defaultShouldSubscribe={isSubscribed}
                    deinitialize={deinitializeCustomer}
                    email={this.draftEmail || email}
                    initialize={initializeCustomer}
                    isLoading={isContinuingAsGuest || isInitializing || isExecutingPaymentMethodCheckout}
                    onChangeEmail={this.handleChangeEmail}
                    onContinueAsGuest={this.handleContinueAsGuest}
                    onShowLogin={this.handleShowLogin}
                    privacyPolicyUrl={privacyPolicyUrl}
                    requiresMarketingConsent={requiresMarketingConsent}
                    step={step}
                />
                :
            <GuestForm
                canSubscribe={canSubscribe}
                checkoutButtons={checkoutButtons}
                continueAsGuestButtonLabelId="customer.continue"
                defaultShouldSubscribe={isSubscribed}
                email={this.draftEmail || email}
                isLoading={isLoadingGuestForm}
                onChangeEmail={this.handleChangeEmail}
                onContinueAsGuest={this.handleContinueAsGuest}
                onShowLogin={this.handleShowLogin}
                privacyPolicyUrl={privacyPolicyUrl}
                requiresMarketingConsent={requiresMarketingConsent}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
            />
        );
    }

    private renderEmailLoginLinkForm(): ReactNode {
        const { isEmailLoginFormOpen, hasRequestedLoginEmail } = this.state;

        const { isSendingSignInEmail, signInEmailError, signInEmail, isFloatingLabelEnabled } =
            this.props;

        return (
            <EmailLoginForm
                email={this.draftEmail}
                emailHasBeenRequested={hasRequestedLoginEmail}
                isOpen={isEmailLoginFormOpen}
                isSendingEmail={isSendingSignInEmail}
                onRequestClose={this.closeEmailLoginFormForm}
                onSendLoginEmail={this.handleSendLoginEmail}
                sentEmail={signInEmail}
                sentEmailError={signInEmailError}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
            />
        );
    }

    private closeEmailLoginFormForm: () => void = () => {
        this.setState({
            isEmailLoginFormOpen: false,
            hasRequestedLoginEmail: false,
        });
    };

    private renderCreateAccountForm(): ReactNode {
        const {
            customerAccountFields,
            isCreatingAccount,
            createAccountError,
            requiresMarketingConsent,
            isFloatingLabelEnabled,
        } = this.props;

        return (
            <CreateAccountForm
                createAccountError={createAccountError}
                formFields={customerAccountFields}
                isCreatingAccount={isCreatingAccount}
                onCancel={this.handleCancelCreateAccount}
                onSubmit={this.handleCreateAccount}
                requiresMarketingConsent={requiresMarketingConsent}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
            />
        );
    }

    private renderLoginForm(): ReactNode {
        const {
            isEmbedded,
            email,
            forgotPasswordUrl,
            isSignInEmailEnabled,
            isGuestEnabled,
            isSendingSignInEmail,
            isSigningIn,
            isAccountCreationEnabled,
            providerWithCustomCheckout,
            signInError,
            isFloatingLabelEnabled,
            viewType,
        } = this.props;

        return (
            <LoginForm
                canCancel={isGuestEnabled}
                continueAsGuestButtonLabelId={
                    providerWithCustomCheckout
                        ? 'customer.continue'
                        : 'customer.continue_as_guest_action'
                }
                email={this.draftEmail || email}
                forgotPasswordUrl={forgotPasswordUrl}
                isSendingSignInEmail={isSendingSignInEmail}
                isSignInEmailEnabled={isSignInEmailEnabled && !isEmbedded}
                isSigningIn={isSigningIn}
                onCancel={this.handleCancelSignIn}
                onChangeEmail={this.handleChangeEmail}
                onContinueAsGuest={this.executePaymentMethodCheckoutOrContinue}
                onCreateAccount={this.showCreateAccount}
                onSendLoginEmail={this.handleEmailLoginClicked}
                onSignIn={this.handleSignIn}
                shouldShowCreateAccountLink={isAccountCreationEnabled}
                signInError={signInError}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
                viewType={viewType}
            />
        );
    }

    private handleEmailLoginClicked: () => void = async () => {
        const { viewType } = this.props;

        try {
            if (viewType !== CustomerViewType.Login && this.draftEmail) {
                await this.handleSendLoginEmail({ email: this.draftEmail });
            }
        } finally {
            this.setState({
                isEmailLoginFormOpen: true,
            });
        }
    };

    private handleSendLoginEmail: (values: EmailLoginFormValues) => Promise<void> = async (
        values,
    ) => {
        const { sendLoginEmail } = this.props;

        try {
            await sendLoginEmail(values);
        } finally {
            this.setState({
                hasRequestedLoginEmail: true,
            });
        }
    };

    private handleContinueAsGuest: (formValues: GuestFormValues) => Promise<void> = async (
        formValues,
    ) => {
        const {
            canSubscribe,
            continueAsGuest,
            hasBillingId,
            defaultShouldSubscribe,
            onChangeViewType = noop,
            onContinueAsGuest = noop,
            onContinueAsGuestError = noop,
            onSubscribeToNewsletter,
        } = this.props;

        const email = formValues.email.trim();
        const updateSubscriptionWhenUnchecked =
            hasBillingId || defaultShouldSubscribe ? false : undefined;

        try {
            const { data } = await continueAsGuest({
                email,
                acceptsMarketingNewsletter:
                    canSubscribe && formValues.shouldSubscribe
                        ? true
                        : updateSubscriptionWhenUnchecked,
                acceptsAbandonedCartEmails: formValues.shouldSubscribe
                    ? true
                    : updateSubscriptionWhenUnchecked,
            });

            onSubscribeToNewsletter(formValues.shouldSubscribe);

            const customer = data.getCustomer();

            if (customer && customer.shouldEncourageSignIn && customer.isGuest && !customer.isStripeLinkAuthenticated) {
                return onChangeViewType(CustomerViewType.SuggestedLogin);
            }

            await this.executePaymentMethodCheckoutOrContinue();

            this.draftEmail = undefined;
        } catch (error) {
            if (
                isErrorWithType(error) &&
                (error.type === 'update_subscriptions' ||
                    error.type === 'payment_method_client_invalid')
            ) {
                this.draftEmail = undefined;

                onContinueAsGuest();
            }

            if (isErrorWithType(error) && error.status === 429) {
                return onChangeViewType(CustomerViewType.EnforcedLogin);
            }

            if (isErrorWithType(error) && error.status === 403) {
                return onChangeViewType(CustomerViewType.CancellableEnforcedLogin);
            }

            onContinueAsGuestError(error);
        }
    };

    private handleSignIn: (credentials: CustomerCredentials) => Promise<void> = async (
        credentials,
    ) => {
        const { signIn, onSignIn = noop, onSignInError = noop } = this.props;

        try {
            await signIn(credentials);
            onSignIn();

            this.draftEmail = undefined;
        } catch (error) {
            onSignInError(error);
        }
    };

    private handleCreateAccount: (values: CreateAccountFormValues) => void = async (values) => {
        const { createAccount = noop, onAccountCreated = noop } = this.props;

        await createAccount(mapCreateAccountFromFormValues(values));

        onAccountCreated();
    };

    private showCreateAccount: () => void = () => {
        const { onChangeViewType = noop } = this.props;

        onChangeViewType(CustomerViewType.CreateAccount);
    };

    private handleCancelCreateAccount: () => void = () => {
        const { clearError, onChangeViewType = noop, createAccountError } = this.props;

        if (createAccountError) {
            clearError(createAccountError);
        }

        onChangeViewType(CustomerViewType.Login);
    };

    private handleCancelSignIn: () => void = () => {
        const { clearError, onChangeViewType = noop, signInError } = this.props;

        if (signInError) {
            clearError(signInError);
        }

        onChangeViewType(CustomerViewType.Guest);
    };

    private handleChangeEmail: (email: string) => void = (email) => {
        const { analyticsTracker } = this.props;

        this.draftEmail = email;
        analyticsTracker.customerEmailEntry(email);
    };

    private handleShowLogin: () => void = () => {
        const { onChangeViewType = noop } = this.props;

        onChangeViewType(CustomerViewType.Login);
    };

    private executePaymentMethodCheckoutOrContinue: () => void = async () => {
        const {
            executePaymentMethodCheckout,
            onContinueAsGuest = noop,
            providerWithCustomCheckout
        } = this.props;

        if (providerWithCustomCheckout && providerWithCustomCheckout !== PaymentMethodId.StripeUPE) {
            await executePaymentMethodCheckout({
                methodId: providerWithCustomCheckout,
                continueWithCheckoutCallback: onContinueAsGuest,
                checkoutPaymentMethodExecuted: (payload) => this.checkoutPaymentMethodExecuted(payload)
            });
        } else {
            onContinueAsGuest();
        }
    };

    private checkoutPaymentMethodExecuted(payload?: CheckoutPaymentMethodExecutedOptions) {
        const { analyticsTracker } = this.props;

        analyticsTracker.customerPaymentMethodExecuted(payload);
    }
}

export function mapToWithCheckoutCustomerProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutCustomerProps | null {
    const {
        data: {
            getBillingAddress,
            getCustomerAccountFields,
            getCheckout,
            getCustomer,
            getSignInEmail,
            getConfig,
        },
        errors: { getSignInError, getSignInEmailError, getCreateCustomerAccountError },
        statuses: {
            isContinuingAsGuest,
            isExecutingPaymentMethodCheckout,
            isInitializingCustomer,
            isSigningIn,
            isSendingSignInEmail,
            isCreatingCustomerAccount,
        },
    } = checkoutState;

    const billingAddress = getBillingAddress();
    const checkout = getCheckout();
    const customer = getCustomer();
    const signInEmail = getSignInEmail();
    const config = getConfig();

    if (!checkout || !config) {
        return null;
    }

    const {
        checkoutSettings: {
            privacyPolicyUrl,
            requiresMarketingConsent,
            isSignInEmailEnabled,
            isAccountCreationEnabled,
        },
    } = config as StoreConfig & { checkoutSettings: { isAccountCreationEnabled: boolean } };

    return {
        customerAccountFields: getCustomerAccountFields(),
        canSubscribe: config.shopperConfig.showNewsletterSignup,
        checkoutButtonIds: config.checkoutSettings.remoteCheckoutProviders,
        clearError: checkoutService.clearError,
        createAccount: checkoutService.createCustomerAccount,
        continueAsGuest: checkoutService.continueAsGuest,
        sendLoginEmail: checkoutService.sendSignInEmail,
        defaultShouldSubscribe: config.shopperConfig.defaultNewsletterSignup,
        deinitializeCustomer: checkoutService.deinitializeCustomer,
        executePaymentMethodCheckout: checkoutService.executePaymentMethodCheckout,
        email: billingAddress?.email || customer?.email,
        firstName: customer?.firstName,
        forgotPasswordUrl: config.links.forgotPasswordLink,
        initializeCustomer: checkoutService.initializeCustomer,
        isCreatingAccount: isCreatingCustomerAccount(),
        createAccountError: getCreateCustomerAccountError(),
        hasBillingId: !!billingAddress?.id,
        isContinuingAsGuest: isContinuingAsGuest(),
        isExecutingPaymentMethodCheckout: isExecutingPaymentMethodCheckout(),
        isInitializing: isInitializingCustomer(),
        isSignInEmailEnabled,
        isAccountCreationEnabled,
        isGuestEnabled: config.checkoutSettings.guestCheckoutEnabled,
        isSigningIn: isSigningIn(),
        isSendingSignInEmail: isSendingSignInEmail(),
        signInEmail,
        signInEmailError: getSignInEmailError(),
        privacyPolicyUrl,
        providerWithCustomCheckout: config.checkoutSettings.providerWithCustomCheckout || undefined,
        requiresMarketingConsent,
        signIn: checkoutService.signInCustomer,
        signInError: getSignInError(),
        isFloatingLabelEnabled: isFloatingLabelEnabled(config.checkoutSettings),
    };
}

export default withAnalytics(withCheckout(mapToWithCheckoutCustomerProps)(Customer));
