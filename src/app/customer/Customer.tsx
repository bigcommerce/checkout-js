import { CheckoutSelectors, CustomerCredentials, CustomerInitializeOptions, CustomerRequestOptions, GuestCredentials, SignInEmail } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, Fragment, ReactNode } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';

import CheckoutButtonList from './CheckoutButtonList';
import CustomerViewType from './CustomerViewType';
import EmailLoginForm, { EmailLoginFormValues } from './EmailLoginForm';
import GuestForm, { GuestFormValues } from './GuestForm';
import LoginForm from './LoginForm';

export interface CustomerProps {
    viewType: CustomerViewType;
    isEmbedded?: boolean;
    checkEmbeddedSupport?(methodIds: string[]): void;
    onChangeViewType?(viewType: CustomerViewType): void;
    onContinueAsGuest?(): void;
    onContinueAsGuestError?(error: Error): void;
    onReady?(): void;
    onSignIn?(): void;
    onSignInError?(error: Error): void;
    onUnhandledError?(error: Error): void;
}

export interface WithCheckoutCustomerProps {
    canSubscribe: boolean;
    checkoutButtonIds: string[];
    createAccountUrl: string;
    defaultShouldSubscribe: boolean;
    email?: string;
    firstName?: string;
    forgotPasswordUrl: string;
    isContinuingAsGuest: boolean;
    isGuestEnabled: boolean;
    isSendingSignInEmail: boolean;
    isSignInEmailEnabled: boolean;
    isSigningIn: boolean;
    privacyPolicyUrl?: string;
    requiresMarketingConsent: boolean;
    signInEmail?: SignInEmail;
    signInEmailError?: Error;
    signInError?: Error;
    clearError(error: Error): Promise<CheckoutSelectors>;
    continueAsGuest(credentials: GuestCredentials): Promise<CheckoutSelectors>;
    deinitializeCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    initializeCustomer(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
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

    componentDidMount(): void {
        const {
            onReady = noop,
            email,
        } = this.props;

        this.draftEmail = email;

        onReady();
    }

    render(): ReactNode {
        const { viewType } = this.props;
        const { isEmailLoginFormOpen } = this.state;

        return (
            <Fragment>
                { isEmailLoginFormOpen && this.renderEmailLoginFormForm() }
                { (viewType === CustomerViewType.Guest) ?
                    this.renderGuestForm() :
                    this.renderLoginForm() }
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

    private renderEmailLoginFormForm(): ReactNode {
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

    private renderLoginForm(): ReactNode {
        const {
            createAccountUrl,
            isEmbedded,
            email,
            forgotPasswordUrl,
            isSignInEmailEnabled,
            isGuestEnabled,
            isSendingSignInEmail,
            isSigningIn,
            onContinueAsGuest,
            signInError,
            viewType,
        } = this.props;

        return (
            <LoginForm
                canCancel={ isGuestEnabled }
                createAccountUrl={ createAccountUrl }
                email={ this.draftEmail || email }
                forgotPasswordUrl={ forgotPasswordUrl }
                isSendingSignInEmail={ isSendingSignInEmail }
                isSignInEmailEnabled={ isSignInEmailEnabled && !isEmbedded }
                isSigningIn={ isSigningIn }
                onCancel={ this.handleCancelSignIn }
                onChangeEmail={ this.handleChangeEmail }
                onContinueAsGuest={ onContinueAsGuest }
                onSendLoginEmail={ this.handleEmailLoginClicked }
                onSignIn={ this.handleSignIn }
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
            onChangeViewType = noop,
            onContinueAsGuest = noop,
            onContinueAsGuestError = noop,
        } = this.props;

        const email = formValues.email.trim();
        try {
            const { data } = await continueAsGuest({
                email,
                acceptsMarketingNewsletter: canSubscribe && formValues.shouldSubscribe ? true : undefined,
                acceptsAbandonedCartEmails: formValues.shouldSubscribe ? true : false,
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
        } catch (error) {
            onSignInError(error);
        }
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
        data: { getBillingAddress, getCheckout, getCustomer, getSignInEmail, getConfig },
        errors: { getSignInError, getSignInEmailError },
        statuses: { isContinuingAsGuest, isSigningIn, isSendingSignInEmail },
    } = checkoutState;

    const billingAddress = getBillingAddress();
    const checkout = getCheckout();
    const customer = getCustomer();
    const signInEmail = getSignInEmail();
    const config = getConfig();

    if (!checkout || !config) {
        return null;
    }

    // todo: add isSignInEmailEnabled to SDK
    const { checkoutSettings: {
        privacyPolicyUrl,
        requiresMarketingConsent,
        isSignInEmailEnabled,
    } } = config as any;

    return {
        canSubscribe: config.shopperConfig.showNewsletterSignup,
        checkoutButtonIds: config.checkoutSettings.remoteCheckoutProviders,
        clearError: checkoutService.clearError,
        continueAsGuest: checkoutService.continueAsGuest,
        // todo: remove casting when method is properly exposed.
        sendLoginEmail: (checkoutService as any).sendSignInEmail as (params: { email: string }) => Promise<CheckoutSelectors>,
        createAccountUrl: config.links.createAccountLink,
        defaultShouldSubscribe: config.shopperConfig.defaultNewsletterSignup,
        deinitializeCustomer: checkoutService.deinitializeCustomer,
        email: (billingAddress && billingAddress.email) || (customer && customer.email),
        firstName: customer && customer.firstName,
        forgotPasswordUrl: config.links.forgotPasswordLink,
        initializeCustomer: checkoutService.initializeCustomer,
        isContinuingAsGuest: isContinuingAsGuest(),
        isSignInEmailEnabled,
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
