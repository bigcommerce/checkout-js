import { CheckoutSelectors, CustomerCredentials, CustomerInitializeOptions, CustomerRequestOptions, GuestCredentials } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, Fragment, ReactNode } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';

import CheckoutButtonList from './CheckoutButtonList';
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
    subscribeToNewsletter?(data: { email: string; firstName?: string }): void;
}

export enum CustomerViewType {
    Guest = 'guest',
    Login = 'login',
}

interface WithCheckoutCustomerProps {
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
                { viewType === CustomerViewType.Login && this.renderLoginForm() }
                { viewType === CustomerViewType.Guest && this.renderGuestForm() }
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
            onChangeViewType = noop,
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
                email={ this.draftEmail || email }
                defaultShouldSubscribe={ defaultShouldSubscribe }
                isContinuingAsGuest={ isContinuingAsGuest }
                onChangeEmail={ this.handleChangeEmail }
                onContinueAsGuest={ this.handleContinueAsGuest }
                onShowLogin={ () => {
                    onChangeViewType(CustomerViewType.Login);
                } }
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
            signInError,
        } = this.props;

        return (
            <LoginForm
                canCancel={ isGuestEnabled }
                createAccountUrl={ createAccountUrl }
                email={ this.draftEmail || email }
                forgotPasswordUrl={ forgotPasswordUrl }
                isSigningIn={ isSigningIn }
                signInError={ signInError }
                onCancel={ this.handleCancelSignIn }
                onChangeEmail={ this.handleChangeEmail }
                onSignIn={ this.handleSignIn }
            />
        );
    }

    private handleContinueAsGuest: (formValues: GuestFormValues) => Promise<void> = async formValues => {
        const {
            canSubscribe,
            continueAsGuest,
            firstName,
            onContinueAsGuest = noop,
            onContinueAsGuestError = noop,
            subscribeToNewsletter = noop,
        } = this.props;

        if (canSubscribe && formValues.shouldSubscribe) {
            subscribeToNewsletter({ email: formValues.email, firstName });
        }

        try {
            await continueAsGuest({ email: formValues.email });
            onContinueAsGuest();

            this.draftEmail = undefined;
        } catch (error) {
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

    if (!billingAddress || !checkout || !customer || !config) {
        return null;
    }

    return {
        canSubscribe: config.shopperConfig.showNewsletterSignup,
        checkoutButtonIds: config.checkoutSettings.remoteCheckoutProviders,
        clearError: checkoutService.clearError,
        continueAsGuest: checkoutService.continueAsGuest,
        createAccountUrl: config.links.createAccountLink,
        defaultShouldSubscribe: config.shopperConfig.defaultNewsletterSignup,
        deinitializeCustomer: checkoutService.deinitializeCustomer,
        email: billingAddress.email || customer.email,
        firstName: customer.firstName,
        forgotPasswordUrl: config.links.forgotPasswordLink,
        initializeCustomer: checkoutService.initializeCustomer,
        isContinuingAsGuest: isContinuingAsGuest(),
        isGuestEnabled: config.checkoutSettings.guestCheckoutEnabled,
        isSigningIn: isSigningIn(),
        signIn: checkoutService.signInCustomer,
        signInError: getSignInError(),
    };
}

export default withCheckout(mapToWithCheckoutCustomerProps)(Customer);
