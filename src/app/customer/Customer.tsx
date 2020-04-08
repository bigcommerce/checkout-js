import { CheckoutSelectors, Customer as CustomerType, CustomerCredentials, CustomerInitializeOptions, CustomerRequestOptions, GuestCredentials } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, Fragment, ReactNode } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';

import CheckoutButtonList from './CheckoutButtonList';
import CustomerViewType from './CustomerViewType';
import GuestForm, { GuestFormValues } from './GuestForm';
import LoginForm from './LoginForm';

export interface CustomerProps {
    viewType: CustomerViewType;
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
    isSigningIn: boolean;
    signInError?: Error;
    privacyPolicyUrl?: string;
    requiresMarketingConsent: boolean;
    clearError(error: Error): Promise<CheckoutSelectors>;
    continueAsGuest(credentials: GuestCredentials): Promise<CheckoutSelectors>;
    deinitializeCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    initializeCustomer(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    signIn(credentials: CustomerCredentials): Promise<CheckoutSelectors>;
}

class Customer extends Component<CustomerProps & WithCheckoutCustomerProps> {
    private draftEmail?: string;

    componentDidMount(): void {
        const { onReady = noop } = this.props;

        onReady();
    }

    render(): ReactNode {
        const { viewType } = this.props;

        return (
            <Fragment>
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

    private renderLoginForm(): ReactNode {
        const {
            createAccountUrl,
            email,
            forgotPasswordUrl,
            isGuestEnabled,
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
                isSigningIn={ isSigningIn }
                onCancel={ this.handleCancelSignIn }
                onChangeEmail={ this.handleChangeEmail }
                onContinueAsGuest={ onContinueAsGuest }
                onSignIn={ this.handleSignIn }
                signInError={ signInError }
                viewType={ viewType }
            />
        );
    }

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

            // todo: remove when SDK has been updated
            const { hasAccount, isGuest } = data.getCustomer() as unknown as CustomerType & { hasAccount: boolean };

            if (hasAccount && isGuest) {
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
        data: { getBillingAddress, getCheckout, getCustomer, getConfig },
        errors: { getSignInError },
        statuses: { isContinuingAsGuest, isSigningIn },
    } = checkoutState;

    const billingAddress = getBillingAddress();
    const checkout = getCheckout();
    const customer = getCustomer();
    const config = getConfig();

    if (!checkout || !config) {
        return null;
    }

    const { checkoutSettings: {
        privacyPolicyUrl,
        requiresMarketingConsent,
    } } = config;

    return {
        canSubscribe: config.shopperConfig.showNewsletterSignup,
        checkoutButtonIds: config.checkoutSettings.remoteCheckoutProviders,
        clearError: checkoutService.clearError,
        continueAsGuest: checkoutService.continueAsGuest,
        createAccountUrl: config.links.createAccountLink,
        defaultShouldSubscribe: config.shopperConfig.defaultNewsletterSignup,
        deinitializeCustomer: checkoutService.deinitializeCustomer,
        email: (billingAddress && billingAddress.email) || (customer && customer.email),
        firstName: customer && customer.firstName,
        forgotPasswordUrl: config.links.forgotPasswordLink,
        initializeCustomer: checkoutService.initializeCustomer,
        isContinuingAsGuest: isContinuingAsGuest(),
        isGuestEnabled: config.checkoutSettings.guestCheckoutEnabled,
        isSigningIn: isSigningIn(),
        privacyPolicyUrl,
        requiresMarketingConsent,
        signIn: checkoutService.signInCustomer,
        signInError: getSignInError(),
    };
}

export default withCheckout(mapToWithCheckoutCustomerProps)(Customer);
