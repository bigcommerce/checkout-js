import { CheckoutSelectors, CustomerAccountRequestBody, CustomerContinueOptions, CustomerContinueRequestOptions, CustomerCredentials, CustomerInitializeOptions, CustomerRequestOptions, FormField, GuestCredentials, PaymentMethod, SignInEmail, StoreConfig } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, Fragment, ReactNode } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';

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
    customerAccountFields: FormField[];
    checkoutButtonIds: string[];
    defaultShouldSubscribe: boolean;
    email?: string;
    firstName?: string;
    forgotPasswordUrl: string;
    isContinuingAsGuest: boolean;
    isCreatingAccount: boolean;
    isGuestEnabled: boolean;
    isSendingSignInEmail: boolean;
    isSignInEmailEnabled: boolean;
    isSigningIn: boolean;
    paymentMethods?: PaymentMethod[];
    privacyPolicyUrl?: string;
    requiresMarketingConsent: boolean;
    signInEmail?: SignInEmail;
    signInEmailError?: Error;
    isAccountCreationEnabled: boolean;
    createAccountError?: Error;
    signInError?: Error;
    clearError(error: Error): Promise<CheckoutSelectors>;
    continueAsGuest(credentials: GuestCredentials): Promise<CheckoutSelectors>;
    createAccount(values: CustomerAccountRequestBody): Promise<CheckoutSelectors>;
    executeBeforeContinueAsGuest(options: CustomerContinueOptions): Promise<CheckoutSelectors>;
    executeBeforeSignIn(options: CustomerContinueOptions): Promise<CheckoutSelectors>;
    executeBeforeSignUp(options: CustomerContinueOptions): Promise<CheckoutSelectors>;
    deinitializeCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    deinitializeContinueCustomer(options: CustomerContinueRequestOptions): Promise<CheckoutSelectors>;
    initializeCustomer(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    initializeContinueCustomer(options: CustomerContinueRequestOptions): Promise<CheckoutSelectors>;
    loadPaymentMethods(): Promise<CheckoutSelectors>;
    sendLoginEmail(params: { email: string }): Promise<CheckoutSelectors>;
    signIn(credentials: CustomerCredentials): Promise<CheckoutSelectors>;
}

export interface CustomerState {
    isEmailLoginFormOpen: boolean;
    hasRequestedLoginEmail: boolean;
}

class Customer extends Component<CustomerProps & WithCheckoutCustomerProps, CustomerState> {
    state: CustomerState = {
        isEmailLoginFormOpen: false,
        hasRequestedLoginEmail: false,
    };

    private draftEmail?: string;
    private providerIdWithCustomContinueFlow: string = 'default';

    async componentDidMount(): Promise<void> {
        const {
            email,
            loadPaymentMethods,
            initializeContinueCustomer,
            onReady = noop,
            onUnhandledError = noop,
        } = this.props;

        this.draftEmail = email;

        try {
            const { data } = await loadPaymentMethods();

            this.providerIdWithCustomContinueFlow = this.getCustomContinueFlowProviderId(data.getPaymentMethods());

            await initializeContinueCustomer({ methodId: this.providerIdWithCustomContinueFlow });
        } catch (error) {
            onUnhandledError(error);
        }

        onReady();
    }

    async componentWillUnmount(): Promise<void> {
        const {
            deinitializeContinueCustomer,
            onUnhandledError = noop,
        } = this.props;

        try {
            await deinitializeContinueCustomer({ methodId: this.providerIdWithCustomContinueFlow });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    render(): ReactNode {
        const { viewType } = this.props;
        const { isEmailLoginFormOpen } = this.state;
        const shouldRenderGuestForm = viewType === CustomerViewType.Guest;
        const shouldRenderCreateAccountForm = viewType === CustomerViewType.CreateAccount;
        const shouldRenderLoginForm = !shouldRenderGuestForm && !shouldRenderCreateAccountForm;

        return (
            <Fragment>
                { isEmailLoginFormOpen && this.renderEmailLoginLinkForm() }
                { shouldRenderLoginForm && this.renderLoginForm() }
                { shouldRenderGuestForm && this.renderGuestForm() }
                { shouldRenderCreateAccountForm && this.renderCreateAccountForm() }
            </Fragment>
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
            privacyPolicyUrl,
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
                        methodIds={ checkoutButtonIds }
                        onError={ onUnhandledError }
                    />
                }
                defaultShouldSubscribe={ defaultShouldSubscribe }
                email={ this.draftEmail || email }
                isContinuingAsGuest={ isContinuingAsGuest }
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
            executeBeforeContinueAsGuest = noop,
            onChangeViewType = noop,
            onContinueAsGuest = noop,
            onContinueAsGuestError = noop,
        } = this.props;

        const email = formValues.email.trim();

        const runDefaultFlow = async () => {
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

                onContinueAsGuest();

                this.draftEmail = undefined;
            } catch (error) {
                if (error.type === 'update_subscriptions') {
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

        await executeBeforeContinueAsGuest({
            email,
            fallback: runDefaultFlow,
            methodId: this.providerIdWithCustomContinueFlow,
        });
    };

    private handleSignIn: (credentials: CustomerCredentials) => Promise<void> = async credentials => {
        const {
            executeBeforeSignIn = noop,
            onSignIn = noop,
            onSignInError = noop,
            signIn,
        } = this.props;

        const runDefaultFlow = async () => {
            try {
                await signIn(credentials);

                onSignIn();

                this.draftEmail = undefined;
            } catch (error) {
                onSignInError(error);
            }
        };

        await executeBeforeSignIn({
            email: credentials?.email,
            fallback: runDefaultFlow,
            methodId: this.providerIdWithCustomContinueFlow,
        });
    };

    private handleCreateAccount: (values: CreateAccountFormValues) => void = async values => {
        const {
            executeBeforeSignUp = noop,
            createAccount = noop,
            onAccountCreated = noop,
        } = this.props;

        const runDefaultFlow = async () => {
            await createAccount(mapCreateAccountFromFormValues(values));
            onAccountCreated();
        };

        await executeBeforeSignUp({
            email: values?.email,
            fallback: runDefaultFlow,
            methodId: this.providerIdWithCustomContinueFlow,
        });
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

    private getCustomContinueFlowProviderId(paymentMethods: PaymentMethod[] = []) {
        return paymentMethods.filter(paymentMethod => paymentMethod?.initializationData?.withCustomContinueFlow)[0]?.id || 'default';
    }
}

export function mapToWithCheckoutCustomerProps(
    { checkoutService, checkoutState }: CheckoutContextProps
): WithCheckoutCustomerProps | null {
    const {
        data: { getBillingAddress, getCustomerAccountFields, getCheckout, getCustomer, getSignInEmail, getConfig, getPaymentMethods },
        errors: { getSignInError, getSignInEmailError, getCreateCustomerAccountError },
        statuses: { isContinuingAsGuest, isSigningIn, isSendingSignInEmail, isCreatingCustomerAccount },
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
        executeBeforeContinueAsGuest: checkoutService.executeBeforeContinueAsGuest,
        executeBeforeSignIn: checkoutService.executeBeforeSignIn,
        executeBeforeSignUp: checkoutService.executeBeforeSignUp,
        sendLoginEmail: checkoutService.sendSignInEmail,
        defaultShouldSubscribe: config.shopperConfig.defaultNewsletterSignup,
        deinitializeContinueCustomer: checkoutService.deinitializeContinueCustomer,
        deinitializeCustomer: checkoutService.deinitializeCustomer,
        email: (billingAddress && billingAddress.email) || (customer && customer.email),
        firstName: customer && customer.firstName,
        forgotPasswordUrl: config.links.forgotPasswordLink,
        initializeContinueCustomer: checkoutService.initializeContinueCustomer,
        initializeCustomer: checkoutService.initializeCustomer,
        isCreatingAccount: isCreatingCustomerAccount(),
        createAccountError: getCreateCustomerAccountError(),
        isContinuingAsGuest: isContinuingAsGuest(),
        isSignInEmailEnabled,
        isAccountCreationEnabled,
        isGuestEnabled: config.checkoutSettings.guestCheckoutEnabled,
        isSigningIn: isSigningIn(),
        isSendingSignInEmail: isSendingSignInEmail(),
        loadPaymentMethods: checkoutService.loadPaymentMethods,
        signInEmail,
        signInEmailError: getSignInEmailError(),
        paymentMethods: getPaymentMethods(),
        privacyPolicyUrl,
        requiresMarketingConsent,
        signIn: checkoutService.signInCustomer,
        signInError: getSignInError(),
    };
}

export default withCheckout(mapToWithCheckoutCustomerProps)(Customer);
