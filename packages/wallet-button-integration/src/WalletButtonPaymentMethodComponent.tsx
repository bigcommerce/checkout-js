import {
    type CheckoutSelectors,
    type CustomerRequestOptions,
    type PaymentInitializeOptions,
    type PaymentMethod,
    type PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { noop, some } from 'lodash';
import React, { type ReactNode, useCallback, useEffect, useRef } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { type PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import normalizeWalletPaymentData from './normalizeWalletPaymentData';
import PaymentView from './PaymentView';
import SignInView from './SignInView';

// `initializationData` is a schema-less object (see normalizeWalletPaymentData),
// so guard our way to the `nonce` field rather than casting.
const getNonce = (initializationData: unknown): string | undefined => {
    if (
        typeof initializationData === 'object' &&
        initializationData !== null &&
        'nonce' in initializationData &&
        typeof initializationData.nonce === 'string'
    ) {
        return initializationData.nonce;
    }

    return undefined;
};

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
            data: { getBillingAddress, getCheckout, isPaymentDataRequired },
        },
    } = useCheckout();

    // Scoped selector: only re-run when the order/finalize error actually
    // changes, rather than on every checkout state change.
    const {
        selectedState: { submitOrderError, finalizeOrderError },
    } = useCheckout(({ errors }) => ({
        submitOrderError: errors.getSubmitOrderError(),
        finalizeOrderError: errors.getFinalizeOrderError(),
    }));

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

    // Wallet providers like Google Pay hand out a single-use token/nonce
    // each time the shopper completes their native payment sheet. Once a
    // payment attempt using that token has been declined, it's spent -
    // resubmitting it just fails again with a generic error. The storefront
    // has no way to invalidate it server-side, so instead remember which
    // token was declined and keep "Place Order" disabled for it, until the
    // shopper goes through the wallet button again for a fresh one (the
    // "Edit"/re-select action already offered below).
    const currentNonce = getNonce(method.initializationData);
    const declinedNonceRef = useRef<string>();

    useEffect(() => {
        if (submitOrderError || finalizeOrderError) {
            declinedNonceRef.current = currentNonce;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submitOrderError, finalizeOrderError]);

    const toggleSubmit = () => {
        const { disableSubmit } = paymentForm;
        const currentIsPaymentDataRequired = isPaymentDataRequired();
        const hasDeclinedPaymentData =
            declinedNonceRef.current !== undefined && declinedNonceRef.current === currentNonce;
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
                        editButtonLabel={editButtonLabel}
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
