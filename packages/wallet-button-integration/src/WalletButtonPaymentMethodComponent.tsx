import {
    CheckoutSelectors,
    CustomerRequestOptions,
    LanguageService,
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { noop, some } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { SignOutLink } from '@bigcommerce/checkout/instrument-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    getPaymentMethodName,
    PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import normalizeWalletPaymentData from './normalizeWalletPaymentData';

export interface WalletButtonPaymentMethodProps {
    checkoutState: CheckoutSelectors;
    language: LanguageService;
    paymentForm: PaymentFormService;
    buttonId: string;
    editButtonClassName?: string;
    editButtonLabel?: ReactNode;
    isInitializing?: boolean;
    method: PaymentMethod;
    shouldShowEditButton?: boolean;
    signInButtonClassName?: string;
    signInButtonLabel?: ReactNode;
    signOutCustomer(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    onSignOut?(): void;
    onSignOutError?(error: Error): void;
    onUnhandledError?(error: Error): void;
}

interface WalletButtonPaymentMethodDerivedProps {
    accountMask?: string;
    cardName?: string;
    cardType?: string;
    expiryMonth?: string;
    expiryYear?: string;
    isPaymentDataRequired: boolean;
    isPaymentSelected: boolean;
}

class WalletButtonPaymentMethodComponent extends Component<WalletButtonPaymentMethodProps> {
    async componentDidMount(): Promise<void> {
        const { initializePayment, method, onUnhandledError = noop } = this.props;

        this.toggleSubmit();

        try {
            await initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    async componentWillUnmount(): Promise<void> {
        const {
            deinitializePayment,
            paymentForm: { disableSubmit },
            method,
            onUnhandledError = noop,
        } = this.props;

        disableSubmit(method, false);

        try {
            await deinitializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    componentDidUpdate(
        prevProps: Readonly<WalletButtonPaymentMethodProps & WalletButtonPaymentMethodDerivedProps>,
    ): void {
        const { method } = this.props;
        const { isPaymentDataRequired } = this.getWalletButtonPaymentMethodDerivedProps();
        const { method: prevMethod, isPaymentDataRequired: prevIsPaymentDataRequired } = prevProps;

        if (
            method.initializationData !== prevMethod.initializationData ||
            isPaymentDataRequired !== prevIsPaymentDataRequired
        ) {
            this.toggleSubmit();
        }
    }

    render(): ReactNode {
        const { isInitializing = false } = this.props;
        const { isPaymentSelected } = this.getWalletButtonPaymentMethodDerivedProps();

        return (
            <LoadingOverlay hideContentWhenLoading isLoading={isInitializing}>
                <div className="paymentMethod paymentMethod--walletButton">
                    {isPaymentSelected ? this.renderPaymentView() : this.renderSignInView()}
                </div>
            </LoadingOverlay>
        );
    }

    private renderSignInView(): ReactNode {
        const { buttonId, signInButtonClassName, signInButtonLabel, method, language } = this.props;

        return (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a className={signInButtonClassName} href="#" id={buttonId} onClick={preventDefault()}>
                {signInButtonLabel || (
                    <TranslatedString
                        data={{ providerName: getPaymentMethodName(language)(method) }}
                        id="remote.sign_in_action"
                    />
                )}
            </a>
        );
    }

    private renderPaymentView(): ReactNode {
        const { buttonId, editButtonClassName, editButtonLabel, shouldShowEditButton, method } =
            this.props;
        const { accountMask, cardName, cardType, expiryMonth, expiryYear } =
            this.getWalletButtonPaymentMethodDerivedProps();

        return (
            <>
                {!!cardName && (
                    <p data-test="payment-method-wallet-card-name">
                        <strong>
                            <TranslatedString id="payment.credit_card_name_label" />:
                        </strong>{' '}
                        {cardName}
                    </p>
                )}

                {!!accountMask && !!cardType && (
                    <p data-test="payment-method-wallet-card-type">
                        <strong>{`${cardType}:`}</strong> {accountMask}
                    </p>
                )}

                {!!expiryMonth && !!expiryYear && (
                    <p data-test="payment-method-wallet-card-expiry">
                        <strong>
                            <TranslatedString id="payment.credit_card_expiration_date_label" />:
                        </strong>{' '}
                        {`${expiryMonth}/${expiryYear}`}
                    </p>
                )}

                {!!shouldShowEditButton && (
                    <p>
                        {
                            // eslint-disable-next-line jsx-a11y/anchor-is-valid
                            <a
                                className={editButtonClassName}
                                href="#"
                                id={buttonId}
                                onClick={preventDefault()}
                            >
                                {editButtonLabel || (
                                    <TranslatedString id="remote.select_different_card_action" />
                                )}
                            </a>
                        }
                    </p>
                )}

                <SignOutLink method={method} onSignOut={this.handleSignOut} />
            </>
        );
    }

    private toggleSubmit(): void {
        const {
            paymentForm: { disableSubmit },
            method,
        } = this.props;
        const { isPaymentDataRequired } = this.getWalletButtonPaymentMethodDerivedProps();

        if (normalizeWalletPaymentData(method.initializationData) || !isPaymentDataRequired) {
            disableSubmit(method, false);
        } else {
            disableSubmit(method, true);
        }
    }

    private handleSignOut: () => void = async () => {
        const { signOutCustomer, method, onSignOut = noop, onSignOutError = noop } = this.props;

        try {
            await signOutCustomer({ methodId: method.id });
            onSignOut();
            window.location.reload();
        } catch (error) {
            onSignOutError(error);
        }
    };

    private getWalletButtonPaymentMethodDerivedProps(): WalletButtonPaymentMethodDerivedProps {
        const { checkoutState, method } = this.props;
        const {
            data: { getBillingAddress, getCheckout, isPaymentDataRequired },
        } = checkoutState;
        const billingAddress = getBillingAddress();
        const checkout = getCheckout();

        if (!billingAddress || !checkout) {
            throw new Error('Unable to get checkout');
        }

        const walletPaymentData = normalizeWalletPaymentData(method.initializationData);

        return {
            ...walletPaymentData,
            // FIXME: I'm not sure how this would work for non-English names.
            cardName:
                walletPaymentData && [billingAddress.firstName, billingAddress.lastName].join(' '),
            isPaymentDataRequired: isPaymentDataRequired(),
            isPaymentSelected: some(checkout.payments, { providerId: method.id }),
        };
    }
}

export default WalletButtonPaymentMethodComponent;
