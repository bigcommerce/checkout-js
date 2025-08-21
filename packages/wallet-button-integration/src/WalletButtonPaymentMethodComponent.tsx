import {
    type CheckoutSelectors,
    type CustomerRequestOptions,
    type LanguageService,
    type PaymentInitializeOptions,
    type PaymentMethod,
    type PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { noop, some } from 'lodash';
import React, { type ReactNode, useCallback, useEffect } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { SignOutLink } from '@bigcommerce/checkout/instrument-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    getPaymentMethodName,
    type PaymentFormService,
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

const WalletButtonPaymentMethodComponent: React.FC<WalletButtonPaymentMethodProps> = (props) => {
    const {
        checkoutState,
        language,
        paymentForm,
        buttonId,
        editButtonClassName,
        editButtonLabel,
        isInitializing = false,
        method,
        shouldShowEditButton,
        signInButtonClassName,
        signInButtonLabel,
        signOutCustomer,
        deinitializePayment,
        initializePayment,
        onSignOut = noop,
        onSignOutError = noop,
        onUnhandledError = noop,
    } = props;

    const getWalletButtonPaymentMethodDerivedProps =
        useCallback((): WalletButtonPaymentMethodDerivedProps => {
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
                    walletPaymentData &&
                    [billingAddress.firstName, billingAddress.lastName].join(' '),
                isPaymentDataRequired: isPaymentDataRequired(),
                isPaymentSelected: some(checkout.payments, { providerId: method.id }),
            };
        }, [checkoutState, method.initializationData, method.id]);

    const derivedProps = getWalletButtonPaymentMethodDerivedProps();

    const toggleSubmit = useCallback(() => {
        const { disableSubmit } = paymentForm;
        const { isPaymentDataRequired } = derivedProps;

        if (normalizeWalletPaymentData(method.initializationData) || !isPaymentDataRequired) {
            disableSubmit(method, false);
        } else {
            disableSubmit(method, true);
        }
    }, [paymentForm, method, derivedProps]);

    const handleSignOut = useCallback(async () => {
        try {
            await signOutCustomer({ methodId: method.id });
            onSignOut();
            window.location.reload();
        } catch (error) {
            onSignOutError(error);
        }
    }, [signOutCustomer, method.id, onSignOut, onSignOutError]);

    useEffect(() => {
        const initializePaymentAsync = async () => {
            toggleSubmit();

            try {
                await initializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                });
            } catch (error) {
                onUnhandledError(error);
            }
        };

        void initializePaymentAsync();

        return () => {
            const deinitializePaymentAsync = async () => {
                const { disableSubmit } = paymentForm;

                disableSubmit(method, false);

                try {
                    await deinitializePayment({
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });
                } catch (error) {
                    onUnhandledError(error);
                }
            };

            void deinitializePaymentAsync();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        toggleSubmit();
    }, [toggleSubmit]);

    const renderSignInView = (): ReactNode => {
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
    };

    const renderPaymentView = (): ReactNode => {
        const { accountMask, cardName, cardType, expiryMonth, expiryYear } = derivedProps;

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

                <SignOutLink method={method} onSignOut={handleSignOut} />
            </>
        );
    };

    const { isPaymentSelected } = derivedProps;

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isInitializing}>
            <div className="paymentMethod paymentMethod--walletButton">
                {isPaymentSelected ? renderPaymentView() : renderSignInView()}
            </div>
        </LoadingOverlay>
    );
};

export default WalletButtonPaymentMethodComponent;
