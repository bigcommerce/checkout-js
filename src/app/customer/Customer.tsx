import { Cart,
    CheckoutSelectors,
    CustomerAccountRequestBody,
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
    FormField,
    GuestCredentials,
    SignInEmail,
    StoreConfig } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';
import { trackLoginData, trackSignUp } from '../common/tracking';
import withRecurly from '../recurly/withRecurly';
import { RecurlyContextProps } from '../recurly/RecurlyContext';
import { LoadingOverlay } from '../ui/loading';

import { CreateAccountFormValues } from './getCreateCustomerValidationSchema';
import mapCreateAccountFromFormValues from './mapCreateAccountFromFormValues';
import CheckoutButtonList from './CheckoutButtonList';
import CreateAccountForm from './CreateAccountForm';
import CustomerViewType from './CustomerViewType';
import EmailLoginForm, { EmailLoginFormValues } from './EmailLoginForm';
import GuestForm, { GuestFormValues } from './GuestForm';
import LoginForm from './LoginForm';
import SubscriptionForm from './SubscriptionForm';

export interface CustomerProps {
    viewType: CustomerViewType;
    isEmbedded?: boolean;
    checkEmbeddedSupport?(methodIds: string[]): void;
    onChangeViewType?(viewType: CustomerViewType): void;
    onAccountCreated?(): void;
    onContinueAsGuest?(): void;
    onContinueAsGuestError?(error: Error): void;
    onReady?(): void;
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
    cart?: Cart;
    clearError(error: Error): Promise<CheckoutSelectors>;
    continueAsGuest(credentials: GuestCredentials): Promise<CheckoutSelectors>;
    deinitializeCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    executePaymentMethodCheckout(options: ExecutePaymentMethodCheckoutOptions): Promise<CheckoutSelectors>;
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

class Customer extends Component<CustomerProps & WithCheckoutCustomerProps & RecurlyContextProps, CustomerState> {
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
            await initializeCustomer({ methodId: providerWithCustomCheckout });
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
        const { viewType, isLoadingRecurly } = this.props;
        const { isEmailLoginFormOpen, isReady } = this.state;
        const shouldRenderGuestForm = viewType === CustomerViewType.Guest;
        const shouldRenderCreateAccountForm = viewType === CustomerViewType.CreateAccount;
        const shouldRenderSubscriptionForm = viewType === CustomerViewType.Subscription;
        const shouldRenderLoginForm = !shouldRenderGuestForm && !shouldRenderCreateAccountForm && !shouldRenderSubscriptionForm;

        return (
            <LoadingOverlay
                isLoading={ !isReady || isLoadingRecurly }
                unmountContentWhenLoading
            >
                { isEmailLoginFormOpen && this.renderEmailLoginLinkForm() }
                { shouldRenderLoginForm && this.renderLoginForm() }
                { shouldRenderGuestForm && this.renderGuestForm() }
                { shouldRenderCreateAccountForm && this.renderCreateAccountForm() }
                { shouldRenderSubscriptionForm && this.renderSubscriptionForm() }
            </LoadingOverlay>
        );
    }

    private renderGuestForm(): ReactNode {
        const {
            canSubscribe,
            checkEmbeddedSupport,
            checkoutButtonIds,
            defaultShouldSubscribe,
            deinitializeCustomer,
            email,
            initializeCustomer,
            isContinuingAsGuest = false,
            isExecutingPaymentMethodCheckout = false,
            isInitializing = false,
            privacyPolicyUrl,
            providerWithCustomCheckout,
            requiresMarketingConsent,
            onUnhandledError = noop,
        } = this.props;

        return (
            <GuestForm
                canSubscribe={ canSubscribe }
                checkoutButtons={
                    <CheckoutButtonList
                        checkEmbeddedSupport={ checkEmbeddedSupport }
                        deinitialize={ deinitializeCustomer }
                        initialize={ initializeCustomer }
                        isInitializing={ isInitializing }
                        methodIds={ checkoutButtonIds }
                        onError={ onUnhandledError }
                    />
                }
                continueAsGuestButtonLabelId={ !!providerWithCustomCheckout ? 'customer.continue' : 'customer.continue_as_guest_action' }
                defaultShouldSubscribe={ defaultShouldSubscribe }
                email={ this.draftEmail || email }
                isLoading={ isContinuingAsGuest || isInitializing || isExecutingPaymentMethodCheckout }
                onChangeEmail={ this.handleChangeEmail }
                onContinueAsGuest={ this.handleContinueAsGuest }
                onShowLogin={ this.handleShowLogin }
                privacyPolicyUrl={ privacyPolicyUrl }
                requiresMarketingConsent={ requiresMarketingConsent }
            />
        );
    }

    private renderEmailLoginLinkForm(): ReactNode {
        const {
            isEmailLoginFormOpen,
            hasRequestedLoginEmail,
        } = this.state;

        const {
            isSendingSignInEmail,
            signInEmailError,
            signInEmail,
        } = this.props;

        return (
            <EmailLoginForm
                email={ this.draftEmail }
                emailHasBeenRequested={ hasRequestedLoginEmail }
                isOpen={ isEmailLoginFormOpen }
                isSendingEmail={ isSendingSignInEmail }
                onRequestClose={ this.closeEmailLoginFormForm }
                onSendLoginEmail={ this.handleSendLoginEmail }
                sentEmail={ signInEmail }
                sentEmailError={ signInEmailError }
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
        } = this.props;

        return (
            <CreateAccountForm
                createAccountError={ createAccountError }
                formFields={ customerAccountFields }
                isCreatingAccount={ isCreatingAccount }
                onCancel={ this.handleCancelCreateAccount }
                onSubmit={ this.handleCreateAccount }
                requiresMarketingConsent={ requiresMarketingConsent }
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
            viewType,
        } = this.props;

        return (
            <LoginForm
                canCancel={ isGuestEnabled }
                continueAsGuestButtonLabelId={ !!providerWithCustomCheckout ? 'customer.continue' : 'customer.continue_as_guest_action' }
                email={ this.draftEmail || email }
                forgotPasswordUrl={ forgotPasswordUrl }
                isSendingSignInEmail={ isSendingSignInEmail }
                isSignInEmailEnabled={ isSignInEmailEnabled && !isEmbedded }
                isSigningIn={ isSigningIn }
                onCancel={ this.handleCancelSignIn }
                onChangeEmail={ this.handleChangeEmail }
                onContinueAsGuest={ this.executePaymentMethodCheckoutOrContinue }
                onCreateAccount={ this.showCreateAccount }
                onSendLoginEmail={ this.handleEmailLoginClicked }
                onSignIn={ this.handleSignIn }
                shouldShowCreateAccountLink={ isAccountCreationEnabled }
                signInError={ signInError }
                viewType={ viewType }
            />
        );
    }

    private renderSubscriptionForm(): ReactNode {
        const {
            canSubscribe,
            checkEmbeddedSupport,
            checkoutButtonIds,
            defaultShouldSubscribe,
            deinitializeCustomer,
            email,
            initializeCustomer,
            isContinuingAsGuest = false,
            isExecutingPaymentMethodCheckout = false,
            isInitializing = false,
            privacyPolicyUrl,
            providerWithCustomCheckout,
            requiresMarketingConsent,
            onUnhandledError = noop,
        } = this.props;

        return (
            <SubscriptionForm
                canSubscribe={ canSubscribe }
                checkoutButtons={
                    <CheckoutButtonList
                        checkEmbeddedSupport={ checkEmbeddedSupport }
                        deinitialize={ deinitializeCustomer }
                        initialize={ initializeCustomer }
                        isInitializing={ isInitializing }
                        methodIds={ checkoutButtonIds }
                        onError={ onUnhandledError }
                    />
                }
                continueAsGuestButtonLabelId={ !!providerWithCustomCheckout ? 'customer.continue' : 'customer.continue_as_guest_action' }
                defaultShouldSubscribe={ defaultShouldSubscribe }
                email={ this.draftEmail || email }
                isLoading={ isContinuingAsGuest || isInitializing || isExecutingPaymentMethodCheckout }
                onChangeEmail={ this.handleChangeEmail }
                onContinueAsGuest={ this.handleContinueAsGuest }
                onCreateAccount={ this.showCreateAccount }
                onShowLogin={ this.handleShowLogin }
                privacyPolicyUrl={ privacyPolicyUrl }
                requiresMarketingConsent={ requiresMarketingConsent }
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

    private handleSendLoginEmail: (values: EmailLoginFormValues) => Promise<void> = async values => {
        const {
            sendLoginEmail,
        } = this.props;

        try {
            await sendLoginEmail(values);
        } finally {
            this.setState({
                hasRequestedLoginEmail: true,
            });
        }
    };

    private handleContinueAsGuest: (formValues: GuestFormValues) => Promise<void> = async formValues => {
        const {
            canSubscribe,
            continueAsGuest,
            onChangeViewType = noop,
            onContinueAsGuest = noop,
            onContinueAsGuestError = noop,
        } = this.props;

        const email = formValues.email.trim();
        try {
            const { data } = await continueAsGuest({
                email,
                acceptsMarketingNewsletter: canSubscribe && formValues.shouldSubscribe ? true : undefined,
                acceptsAbandonedCartEmails: formValues.shouldSubscribe ? true : undefined,
            });

            const customer = data.getCustomer();

            if (customer && customer.shouldEncourageSignIn && customer.isGuest) {
               return onChangeViewType(CustomerViewType.SuggestedLogin);
            }

            await this.executePaymentMethodCheckoutOrContinue();

            this.draftEmail = undefined;
        } catch (error) {
            if (error.type === 'update_subscriptions' || error.type === 'payment_method_client_invalid') {
                this.draftEmail = undefined;

                onContinueAsGuest();
            }

            if (error.status === 429) {
                return onChangeViewType(CustomerViewType.EnforcedLogin);
            }

            if (error.status === 403) {
                return onChangeViewType(CustomerViewType.CancellableEnforcedLogin);
            }

            onContinueAsGuestError(error);
        }
    };

    private handleSignIn: (credentials: CustomerCredentials) => Promise<void> = async credentials => {
        const {
            signIn,
            onSignIn = noop,
            onSignInError = noop,
        } = this.props;

        try {
            await signIn(credentials);
            onSignIn();

            this.draftEmail = undefined;
            const {
                cart,
            } = this.props;
            trackLoginData(cart?.customerId, cart?.email);
        } catch (error) {
            onSignInError(error);
        }
    };

    private handleCreateAccount: (values: CreateAccountFormValues) => void = async values => {
        const {
            createAccount = noop,
            onAccountCreated = noop,
        } = this.props;

        await createAccount(mapCreateAccountFromFormValues(values));

        onAccountCreated();
        const {
            cart,
        } = this.props;
        trackSignUp('Checkout', cart?.customerId, cart?.email);
    };

    private showCreateAccount: () => void = () => {
        const {
            onChangeViewType = noop,
        } = this.props;

        onChangeViewType(CustomerViewType.CreateAccount);
    };

    private handleCancelCreateAccount: () => void = () => {
        const {
            clearError,
            onChangeViewType = noop,
            createAccountError,
        } = this.props;

        if (createAccountError) {
            clearError(createAccountError);
        }

        onChangeViewType(CustomerViewType.Login);
    };

    private handleCancelSignIn: () => void = () => {
        const {
            clearError,
            onChangeViewType = noop,
            signInError,
            hasSubscription,
        } = this.props;

        if (signInError) {
            clearError(signInError);
        }

        onChangeViewType(hasSubscription ? CustomerViewType.Subscription : CustomerViewType.Guest);
    };

    private handleChangeEmail: (email: string) => void = email => {
        this.draftEmail = email;
    };

    private handleShowLogin: () => void = () => {
        const { onChangeViewType = noop } = this.props;

        onChangeViewType(CustomerViewType.Login);
    };

    private executePaymentMethodCheckoutOrContinue: () => void = async () => {
        const {
            executePaymentMethodCheckout,
            onContinueAsGuest = noop,
            providerWithCustomCheckout,
        } = this.props;

        if (providerWithCustomCheckout) {
            await executePaymentMethodCheckout({ methodId: providerWithCustomCheckout, continueWithCheckoutCallback: onContinueAsGuest });
        } else {
            onContinueAsGuest();
        }
    };
}

export function mapToWithCheckoutCustomerProps(
    { checkoutService, checkoutState }: CheckoutContextProps
): WithCheckoutCustomerProps | null {
    const {
        data: { getBillingAddress, getCustomerAccountFields, getCheckout, getCustomer, getSignInEmail, getConfig, getCart },
        errors: { getSignInError, getSignInEmailError, getCreateCustomerAccountError },
        statuses: { isContinuingAsGuest, isExecutingPaymentMethodCheckout, isInitializingCustomer, isSigningIn, isSendingSignInEmail, isCreatingCustomerAccount },
    } = checkoutState;

    const billingAddress = getBillingAddress();
    const checkout = getCheckout();
    const customer = getCustomer();
    const signInEmail = getSignInEmail();
    const config = getConfig();
    const cart = getCart();

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
        isContinuingAsGuest: isContinuingAsGuest(),
        isExecutingPaymentMethodCheckout: isExecutingPaymentMethodCheckout(),
        isInitializing:  isInitializingCustomer(),
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
        cart,
    };
}

export default withRecurly(props => props)(withCheckout(mapToWithCheckoutCustomerProps)(Customer));
