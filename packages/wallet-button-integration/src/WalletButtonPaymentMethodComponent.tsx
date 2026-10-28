import {
    type CheckoutSelectors,
    type CustomerRequestOptions,
    type PaymentInitializeOptions,
    type PaymentMethod,
    type PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { noop, some } from 'lodash';
import React, { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    isGooglePayHandleUnsuccessful3dsCheckExperimentOn,
    type PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import getNonce from './getNonce';
import normalizeWalletPaymentData from './normalizeWalletPaymentData';
import PaymentView from './PaymentView';
import SignInView from './SignInView';
import isWalletTokenInvalidationError from './walletTokenInvalidation';

export interface WalletButtonPaymentMethodProps {
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

const WalletButtonPaymentMethodComponent: React.FC<WalletButtonPaymentMethodProps> = ({
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
}) => {
    const {
        checkoutState: {
            data: { getBillingAddress, getCheckout, getConfig, isPaymentDataRequired },
            errors: { getSubmitOrderError, getFinalizeOrderError },
        },
    } = useCheckout();

    const submitOrderError = getSubmitOrderError();
    const finalizeOrderError = getFinalizeOrderError();
    const checkoutSettings = getConfig()?.checkoutSettings;

    const isHandleUnsuccessful3dsCheckExperimentOn =
        method.id.startsWith('googlepay') &&
        isGooglePayHandleUnsuccessful3dsCheckExperimentOn(checkoutSettings);

    const billingAddress = getBillingAddress();
    const checkout = getCheckout();

    if (!billingAddress || !checkout) {
        throw new Error('Unable to get checkout');
    }

    const walletPaymentData = normalizeWalletPaymentData(method.initializationData);
    const isPaymentSelected = some(checkout.payments, { providerId: method.id });
    // FIXME: I'm not sure how this would work for non-English names.
    const cardName =
        walletPaymentData && [billingAddress.firstName, billingAddress.lastName].join(' ');

    const currentNonce = getNonce(method.initializationData);
    const previousNonceRef = useRef(currentNonce);
    const previousNonce = previousNonceRef.current;

    useEffect(() => {
        previousNonceRef.current = currentNonce;
    });

    const [declined, setDeclined] = useState<{ nonce: string | undefined } | null>(null);

    useEffect(() => {
        if (
            isHandleUnsuccessful3dsCheckExperimentOn &&
            isPaymentSelected &&
            (isWalletTokenInvalidationError(submitOrderError) ||
                isWalletTokenInvalidationError(finalizeOrderError))
        ) {
            setDeclined({ nonce: previousNonce });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submitOrderError, finalizeOrderError]);

    const hasDeclinedPaymentData = declined !== null && declined.nonce === currentNonce;

    const toggleSubmit = () => {
        const { disableSubmit } = paymentForm;
        const currentIsPaymentDataRequired = isPaymentDataRequired();
        const hasValidWalletData =
            normalizeWalletPaymentData(method.initializationData) || !currentIsPaymentDataRequired;

        if (!hasDeclinedPaymentData && hasValidWalletData) {
            disableSubmit(method, false);
        } else {
            disableSubmit(method, true);
        }
    };

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
    });

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isInitializing}>
            <div className="paymentMethod paymentMethod--walletButton">
                {isPaymentSelected ? (
                    <PaymentView
                        {...walletPaymentData}
                        buttonId={buttonId}
                        cardName={cardName}
                        editButtonClassName={editButtonClassName}
                        editButtonLabel={
                            hasDeclinedPaymentData ? (
                                <TranslatedString id="remote.retry_same_card_action" />
                            ) : (
                                editButtonLabel
                            )
                        }
                        method={method}
                        onSignOut={handleSignOut}
                        shouldShowEditButton={shouldShowEditButton}
                    />
                ) : (
                    <SignInView
                        buttonId={buttonId}
                        method={method}
                        signInButtonClassName={signInButtonClassName}
                        signInButtonLabel={signInButtonLabel}
                    />
                )}
            </div>
        </LoadingOverlay>
    );
};

export default WalletButtonPaymentMethodComponent;
