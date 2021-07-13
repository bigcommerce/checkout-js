import { CheckoutSelectors, CustomerAccountRequestBody, CustomerCredentials, CustomerInitializeOptions, CustomerRequestOptions, FormField, GuestCredentials, SignInEmail, StoreConfig } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';
import { LoadingOverlay } from '../ui/loading';

import { CreateAccountFormValues } from './getCreateCustomerValidationSchema';
import mapCreateAccountFromFormValues from './mapCreateAccountFromFormValues';
import CheckoutButtonList from './CheckoutButtonList';
import CreateAccountForm from './CreateAccountForm';
import CustomerViewType from './CustomerViewType';
import EmailLoginForm, { EmailLoginFormValues } from './EmailLoginForm';
import GuestForm, { GuestFormValues } from './GuestForm';
import LoginForm from './LoginForm';

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
    customContinueFlowProviderId?: string;
    customerAccountFields: FormField[];
    checkoutButtonIds: string[];
    defaultShouldSubscribe: boolean;
    email?: string;
    firstName?: string;
    forgotPasswordUrl: string;
    isContinuingAsGuest: boolean;
    isCreatingAccount: boolean;
    isGuestEnabled: boolean;
    isInitializing: boolean;
    isSendingSignInEmail: boolean;
    isSignInEmailEnabled: boolean;
    isSigningIn: boolean;
    privacyPolicyUrl?: string;
    requiresMarketingConsent: boolean;
    signInEmail?: SignInEmail;
    signInEmailError?: Error;
    isAccountCreationEnabled: boolean;
    createAccountError?: Error;
    signInError?: Error;
    clearError(error: Error): Promise<CheckoutSelectors>;
    continueAsGuest(credentials: GuestCredentials, options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    deinitializeCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    initializeCustomer(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    sendLoginEmail(params: { email: string }): Promise<CheckoutSelectors>;
    signIn(credentials: CustomerCredentials, options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    createAccount(values: CustomerAccountRequestBody, options: CustomerRequestOptions): Promise<CheckoutSelectors>;
}

export interface CustomerState {
    isReady: boolean;
    isEmailLoginFormOpen: boolean;
    hasRequestedLoginEmail: boolean;
}

class Customer extends Component<CustomerProps & WithCheckoutCustomerProps, CustomerState> {
    state: CustomerState = {
        isReady: false,
        isEmailLoginFormOpen: false,
        hasRequestedLoginEmail: false,
    };

    private draftEmail?: string;

    async componentDidMount(): Promise<void> {
        const {
            customContinueFlowProviderId,
            email,
            initializeCustomer,
            onReady = noop,
            onUnhandledError = noop,
        } = this.props;

        this.draftEmail = email;

        try {
            if (customContinueFlowProviderId) {
                await initializeCustomer({ methodId: customContinueFlowProviderId });
            }
        } catch (error) {
            onUnhandledError(error);
        }

        this.setState({ isReady: true });
        onReady();
    }

    async componentWillUnmount(): Promise<void> {
        const {
            customContinueFlowProviderId,
            deinitializeCustomer,
            onUnhandledError = noop,
        } = this.props;

        try {
            await deinitializeCustomer({methodId: customContinueFlowProviderId});
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
            <LoadingOverlay
                isLoading={ !isReady }
                unmountContentWhenLoading
            >
                { isEmailLoginFormOpen && this.renderEmailLoginLinkForm() }
                { shouldRenderLoginForm && this.renderLoginForm() }
                { shouldRenderGuestForm && this.renderGuestForm() }
                { shouldRenderCreateAccountForm && this.renderCreateAccountForm() }
            </LoadingOverlay>
        );
    }

    private renderGuestForm(): ReactNode {
        const {
            canSubscribe,
            checkEmbeddedSupport,
            checkoutButtonIds,
            customContinueFlowProviderId,
            defaultShouldSubscribe,
            deinitializeCustomer,
            email,
            initializeCustomer,
            isContinuingAsGuest = false,
            isInitializing = false,
            privacyPolicyUrl,
            requiresMarketingConsent,
            onUnhandledError = noop,
        } = this.props;

        const continueAsGuestButtonLabelId = !!customContinueFlowProviderId ? 'customer.continue' : undefined;

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
                customContinueAsGuestButtonLabelId={ continueAsGuestButtonLabelId }
                defaultShouldSubscribe={ defaultShouldSubscribe }
                email={ this.draftEmail || email }
                isLoading={ isContinuingAsGuest || isInitializing }
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
        } = this.props;

        return (
            <CreateAccountForm
                createAccountError={ createAccountError }
                formFields={ customerAccountFields }
                isCreatingAccount={ isCreatingAccount }
                onCancel={ this.handleCancelCreateAccount }
                onSubmit={ this.handleCreateAccount }
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
            onContinueAsGuest,
            signInError,
            viewType,
        } = this.props;

        return (
            <LoginForm
                canCancel={ isGuestEnabled }
                email={ this.draftEmail || email }
                forgotPasswordUrl={ forgotPasswordUrl }
                isSendingSignInEmail={ isSendingSignInEmail }
                isSignInEmailEnabled={ isSignInEmailEnabled && !isEmbedded }
                isSigningIn={ isSigningIn }
                onCancel={ this.handleCancelSignIn }
                onChangeEmail={ this.handleChangeEmail }
                onContinueAsGuest={ onContinueAsGuest }
                onCreateAccount={ this.showCreateAccount }
                onSendLoginEmail={ this.handleEmailLoginClicked }
                onSignIn={ this.handleSignIn }
                shouldShowCreateAccountLink={ isAccountCreationEnabled }
                signInError={ signInError }
                viewType={ viewType }
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
            customContinueFlowProviderId,
            onChangeViewType = noop,
            onContinueAsGuest = noop,
            onContinueAsGuestError = noop,
        } = this.props;

        const email = formValues.email.trim();
        try {
            const credentials = {
                email,
                acceptsMarketingNewsletter: canSubscribe && formValues.shouldSubscribe ? true : undefined,
                acceptsAbandonedCartEmails: formValues.shouldSubscribe ? true : undefined,
            };

            const options = { methodId: customContinueFlowProviderId };

            const { data } = await continueAsGuest(credentials, options);

            const customer = data.getCustomer();

            if (customer && customer.shouldEncourageSignIn && customer.isGuest) {
                return onChangeViewType(CustomerViewType.SuggestedLogin);
            }

            onContinueAsGuest();

            this.draftEmail = undefined;
        } catch (error) {
            if (
                error.type === 'update_subscriptions'
                || error.type === 'not_initialized'
                || error.type === 'missing_data'
                || error.type === 'unhandled_external'
            ) {
                this.draftEmail = undefined;

                return onContinueAsGuest();
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
            customContinueFlowProviderId,
            signIn,
            onSignIn = noop,
            onSignInError = noop,
        } = this.props;

        try {
            const options = { methodId: customContinueFlowProviderId };

            await signIn(credentials, options);

            onSignIn();

            this.draftEmail = undefined;
        } catch (error) {
            if (
                error.type === 'not_initialized'
                || error.type === 'missing_data'
                || error.type === 'unhandled_external'
            ) {
                this.draftEmail = undefined;

                return onSignIn();
            }

            onSignInError(error);
        }
    };

    private handleCreateAccount: (values: CreateAccountFormValues) => void = async values => {
        const {
            createAccount,
            customContinueFlowProviderId,
            onAccountCreated = noop,
        } = this.props;

        const options = { methodId: customContinueFlowProviderId };

        try {
            await createAccount(
                mapCreateAccountFromFormValues(values),
                options
            );
        } catch (error) {
            if (
                error.type === 'not_initialized'
                || error.type === 'missing_data'
                || error.type === 'unhandled_external'
            ) {
                this.draftEmail = undefined;

                return onAccountCreated();
            }
        }
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
        } = this.props;

        if (signInError) {
            clearError(signInError);
        }

        onChangeViewType(CustomerViewType.Guest);
    };

    private handleChangeEmail: (email: string) => void = email => {
        this.draftEmail = email;
    };

    private handleShowLogin: () => void = () => {
        const { onChangeViewType = noop } = this.props;

        onChangeViewType(CustomerViewType.Login);
    };
}

export function mapToWithCheckoutCustomerProps(
    { checkoutService, checkoutState }: CheckoutContextProps
): WithCheckoutCustomerProps | null {
    const {
        data: { getBillingAddress, getCustomerAccountFields, getCheckout, getCustomer, getSignInEmail, getConfig },
        errors: { getSignInError, getSignInEmailError, getCreateCustomerAccountError },
        statuses: { isContinuingAsGuest, isInitializingCustomer, isSigningIn, isSendingSignInEmail, isCreatingCustomerAccount },
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
        customContinueFlowProviderId: config.checkoutSettings.customContinueFlowProviderId,
        checkoutButtonIds: config.checkoutSettings.remoteCheckoutProviders,
        clearError: checkoutService.clearError,
        createAccount: checkoutService.createCustomerAccount,
        continueAsGuest: checkoutService.continueAsGuest,
        sendLoginEmail: checkoutService.sendSignInEmail,
        defaultShouldSubscribe: config.shopperConfig.defaultNewsletterSignup,
        deinitializeCustomer: checkoutService.deinitializeCustomer,
        email: (billingAddress && billingAddress.email) || (customer && customer.email),
        firstName: customer && customer.firstName,
        forgotPasswordUrl: config.links.forgotPasswordLink,
        initializeCustomer: checkoutService.initializeCustomer,
        isCreatingAccount: isCreatingCustomerAccount(),
        createAccountError: getCreateCustomerAccountError(),
        isContinuingAsGuest: isContinuingAsGuest(),
        isInitializing:  isInitializingCustomer(),
        isSignInEmailEnabled,
        isAccountCreationEnabled,
        isGuestEnabled: config.checkoutSettings.guestCheckoutEnabled,
        isSigningIn: isSigningIn(),
        isSendingSignInEmail: isSendingSignInEmail(),
        signInEmail,
        signInEmailError: getSignInEmailError(),
        privacyPolicyUrl,
        requiresMarketingConsent,
        signIn: checkoutService.signInCustomer,
        signInError: getSignInError(),
    };
}

export default withCheckout(mapToWithCheckoutCustomerProps)(Customer);
