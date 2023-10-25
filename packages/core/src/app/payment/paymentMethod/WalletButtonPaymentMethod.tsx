import {
    CheckoutSelectors,
    CustomerRequestOptions,
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { number } from 'card-validator';
import { noop, some } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';


import { withCheckout } from '../../checkout';
import { LoadingOverlay } from '../../ui/loading';
import withPayment, { WithPaymentProps } from '../withPayment';

import getPaymentMethodName from './getPaymentMethodName';
import { PaymentMethodProps } from './PaymentMethod';
import SignOutLink from './SignOutLink';

export interface WalletButtonPaymentMethodProps {
    buttonId: string;
    editButtonClassName?: string;
    editButtonLabel?: ReactNode;
    isInitializing?: boolean;
    method: PaymentMethod;
    shouldShowEditButton?: boolean;
    signInButtonClassName?: string;
    signInButtonLabel?: ReactNode;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    onSignOut?(): void;
    onSignOutError?(error: Error): void;
    onUnhandledError?(error: Error): void;
}

interface WithCheckoutWalletButtonPaymentMethodProps {
    accountMask?: string;
    cardName?: string;
    cardType?: string;
    expiryMonth?: string;
    expiryYear?: string;
    isPaymentDataRequired: boolean;
    isPaymentSelected: boolean;
    signOut(options: CustomerRequestOptions): void;
}

class WalletButtonPaymentMethod extends Component<
    WalletButtonPaymentMethodProps &
        WithCheckoutWalletButtonPaymentMethodProps &
        WithLanguageProps &
        WithPaymentProps
> {
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
        const { deinitializePayment, disableSubmit, method, onUnhandledError = noop } = this.props;

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
        prevProps: Readonly<
            PaymentMethodProps &
                WalletButtonPaymentMethodProps &
                WithCheckoutWalletButtonPaymentMethodProps &
                WithLanguageProps
        >,
    ): void {
        const { method, isPaymentDataRequired } = this.props;
        const { method: prevMethod, isPaymentDataRequired: prevIsPaymentDataRequired } = prevProps;

        if (
            method.initializationData !== prevMethod.initializationData ||
            isPaymentDataRequired !== prevIsPaymentDataRequired
        ) {
            this.toggleSubmit();
        }
    }

    render(): ReactNode {
        const { isInitializing = false, isPaymentSelected } = this.props;

        return (
            <LoadingOverlay hideContentWhenLoading isLoading={isInitializing}>
                <div className="paymentMethod paymentMethod--walletButton">
                    {isPaymentSelected ? this.renderPaymentView() : this.renderSignInView()}
                </div>
            </LoadingOverlay>
        );
    }

    private renderSignInView(): ReactNode {
        const { buttonId, language, signInButtonClassName, signInButtonLabel, method } = this.props;

        return (
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
        const {
            accountMask,
            buttonId,
            cardName,
            cardType,
            editButtonClassName,
            editButtonLabel,
            expiryMonth,
            expiryYear,
            shouldShowEditButton,
            method,
        } = this.props;

        return (
            <>
                {cardName && (
                    <p data-test="payment-method-wallet-card-name">
                        <strong>
                            <TranslatedString id="payment.credit_card_name_label" />:
                        </strong>{' '}
                        {cardName}
                    </p>
                )}

                {accountMask && (
                    <p data-test="payment-method-wallet-card-type">
                        <strong>{`${cardType}:`}</strong> {accountMask}
                    </p>
                )}

                {expiryMonth && expiryYear && (
                    <p data-test="payment-method-wallet-card-expiry">
                        <strong>
                            <TranslatedString id="payment.credit_card_expiration_date_label" />:
                        </strong>{' '}
                        {`${expiryMonth}/${expiryYear}`}
                    </p>
                )}

                {shouldShowEditButton && (
                    <p>
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
                    </p>
                )}

                <SignOutLink method={method} onSignOut={this.handleSignOut} />
            </>
        );
    }

    private toggleSubmit(): void {
        const { disableSubmit, method, isPaymentDataRequired } = this.props;

        if (normalizeWalletPaymentData(method.initializationData) || !isPaymentDataRequired) {
            disableSubmit(method, false);
        } else {
            disableSubmit(method, true);
        }
    }

    private handleSignOut: () => void = async () => {
        const { method, signOut, onSignOut = noop, onSignOutError = noop } = this.props;

        try {
            await signOut({ methodId: method.id });
            onSignOut();
            window.location.reload();
        } catch (error) {
            onSignOutError(error);
        }
    };
}

interface WalletPaymentData {
    accountMask: string;
    cardType: string;
    expiryMonth?: string;
    expiryYear?: string;
}

// For some odd reason, `initializationData` is a schema-less object. So in
// order to use it safely, we have to normalize it first.
function normalizeWalletPaymentData(data: any): WalletPaymentData | undefined {
    if (!data) {
        return;
    }

    if (data.card_information) {
        return {
            accountMask: formatAccountMask(data.card_information.number),
            cardType: data.card_information.type,
        };
    }

    if (data.cardData) {
        return {
            accountMask: formatAccountMask(data.cardData.accountMask),
            cardType: data.cardData.cardType,
            expiryMonth: data.cardData.expMonth,
            expiryYear: data.cardData.expYear,
        };
    }

    if (data.accountNum) {
        const { card } = number(data.accountNum);

        return {
            accountMask: formatAccountMask(data.accountMask),
            expiryMonth: data.expDate && `${data.expDate}`.substr(0, 2),
            expiryYear: data.expDate && `${data.expDate}`.substr(2, 2),
            cardType: card ? card.niceType : '',
        };
    }
}

function formatAccountMask(accountMask = '', padding = '****'): string {
    return accountMask.indexOf('*') > -1 ? accountMask : `${padding} ${accountMask}`;
}

function mapFromCheckoutProps(
    { checkoutService, checkoutState }: CheckoutContextProps,
    { method }: WalletButtonPaymentMethodProps,
): WithCheckoutWalletButtonPaymentMethodProps | null {
    const {
        data: { getBillingAddress, getCheckout, isPaymentDataRequired },
    } = checkoutState;
    const billingAddress = getBillingAddress();
    const checkout = getCheckout();

    if (!billingAddress || !checkout) {
        return null;
    }

    const walletPaymentData = normalizeWalletPaymentData(method.initializationData);

    return {
        ...walletPaymentData,
        // FIXME: I'm not sure how this would work for non-English names.
        cardName:
            walletPaymentData && [billingAddress.firstName, billingAddress.lastName].join(' '),
        isPaymentDataRequired: isPaymentDataRequired(),
        isPaymentSelected: some(checkout.payments, { providerId: method.id }),
        signOut: checkoutService.signOutCustomer,
    };
}

export default withLanguage(
    withPayment(withCheckout(mapFromCheckoutProps)(WalletButtonPaymentMethod)),
);
