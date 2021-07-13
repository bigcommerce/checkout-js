import { CheckoutSelectors, CustomerAccountRequestBody, CustomerContinueOptions, CustomerCredentials, CustomerInitializeOptions, CustomerRequestOptions, FormField, GuestCredentials, SignInEmail, StoreConfig } from '@bigcommerce/checkout-sdk';
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
    isEditingMode?: boolean;
    checkEmbeddedSupport?(methodIds: string[]): void;
    onChangeViewType?(viewType: CustomerViewType): void;
    onAccountCreated?(): void;
    onAccountCreatedError?(error: Error): void;
    onContinue?(): void;
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
    customContinueFlowProviderId?: string;
    defaultShouldSubscribe: boolean;
    email?: string;
    firstName?: string;
    forgotPasswordUrl: string;
    isContinuingAsGuest: boolean;
    isCreatingAccount: boolean;
    isCustomerContinuing: boolean;
    isGuest?: boolean;
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
    customerContinue(options: CustomerContinueOptions): Promise<CheckoutSelectors>;
    continueAsGuest(credentials: GuestCredentials): Promise<CheckoutSelectors>;
    deinitializeCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
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

class Customer extends Component<CustomerProps & WithCheckoutCustomerProps, CustomerState> {
    state: CustomerState = {
        isEmailLoginFormOpen: false,
        isReady: false,
        hasRequestedLoginEmail: false,
    };

    private draftEmail?: string;

    async componentDidMount(): Promise<void> {
        const {
            customerContinue,
            customContinueFlowProviderId,
            email,
            initializeCustomer,
            isEditingMode,
            isGuest,
            onContinue,
            onReady = noop,
            onUnhandledError = noop,
        } = this.props;

        this.draftEmail = email;

        try {
            await initializeCustomer({ methodId: customContinueFlowProviderId });

            if (!isEditingMode && email && !isGuest) {
                const options = {
                    methodId: customContinueFlowProviderId,
                    fallback: onContinue,
                };

                // in default flow will run fallback automatically
                await customerContinue(options);

                return;
            }
        } catch (error) {
            onUnhandledError(error);
        }

        this.setState({ isReady: true });
        onReady();
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
            isCustomerContinuing = false,
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
                isLoading={ isContinuingAsGuest || isInitializing || isCustomerContinuing }
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
            customerContinue,
            customContinueFlowProviderId,
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

            const options = {
                methodId: customContinueFlowProviderId,
                fallback: onContinueAsGuest,
            };

            // in default flow will run fallback automatically
            await customerContinue(options);

            this.draftEmail = undefined;
        } catch (error) {
            if (error.type === 'update_subscriptions' && error.type === 'unhandled_external') {
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
            signIn,
            onSignIn = noop,
            onSignInError = noop,
            customerContinue,
            customContinueFlowProviderId,
        } = this.props;

        try {
            await signIn(credentials);

            const options = {
                methodId: customContinueFlowProviderId,
                fallback: onSignIn,
            };

            // in default flow it will run fallback automatically
            await customerContinue(options);

            this.draftEmail = undefined;
        } catch (error) {
            if (error === 'unhandled_external') {
                this.draftEmail = undefined;

                return onSignIn();
            }

            onSignInError(error);
        }
    };

    private handleCreateAccount: (values: CreateAccountFormValues) => void = async values => {
        const {
            customerContinue,
            customContinueFlowProviderId,
            createAccount = noop,
            onAccountCreated = noop,
            onAccountCreatedError = noop,
        } = this.props;

        try {
            await createAccount(mapCreateAccountFromFormValues(values));

            const options = {
                methodId: customContinueFlowProviderId,
                fallback: onAccountCreated,
            };

            // in default flow it will run fallback automatically
            await customerContinue(options);
        } catch (error) {
            if (error === 'unhandled_external') {
                this.draftEmail = undefined;

                return onAccountCreated();
            }

            onAccountCreatedError(error);
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
        statuses: { isContinuingAsGuest, isCustomerContinuing, isInitializingCustomer, isSigningIn, isSendingSignInEmail, isCreatingCustomerAccount },
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
        customContinueFlowProviderId: config.checkoutSettings.customContinueFlowProviderId,
        customerAccountFields: getCustomerAccountFields(),
        canSubscribe: config.shopperConfig.showNewsletterSignup,
        checkoutButtonIds: config.checkoutSettings.remoteCheckoutProviders,
        clearError: checkoutService.clearError,
        createAccount: checkoutService.createCustomerAccount,
        continueAsGuest: checkoutService.continueAsGuest,
        customerContinue: checkoutService.customerContinue,
        sendLoginEmail: checkoutService.sendSignInEmail,
        defaultShouldSubscribe: config.shopperConfig.defaultNewsletterSignup,
        deinitializeCustomer: checkoutService.deinitializeCustomer,
        email: billingAddress?.email || customer?.email,
        firstName: customer && customer.firstName,
        forgotPasswordUrl: config.links.forgotPasswordLink,
        initializeCustomer: checkoutService.initializeCustomer,
        isCreatingAccount: isCreatingCustomerAccount(),
        isGuest: customer?.isGuest,
        createAccountError: getCreateCustomerAccountError(),
        isContinuingAsGuest: isContinuingAsGuest(),
        isCustomerContinuing: isCustomerContinuing(),
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
