import {
    type CheckoutSelectors,
    type CustomerRequestOptions,
    type PaymentInitializeOptions,
    type PaymentMethod,
    type PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { noop, some } from 'lodash';
import React, { type ReactNode, useCallback, useEffect, useState } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    isGooglePayHandleUnsuccessful3dsCheckExperimentOn,
    type PaymentFormService,
    PaymentMethodType,
} from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import normalizeWalletPaymentData from './normalizeWalletPaymentData';
import PaymentView from './PaymentView';
import SignInView from './SignInView';

const WALLET_TOKEN_INVALIDATION_IGNORED_ERROR_TYPES = new Set([
    'order_finalization_not_required',
    'payment_cancelled',
    'payment_invalid_form',
    'spam_protection_not_completed',
    'invalid_hosted_form_value',
    'cart_consistency',
    'cart_stock_positions_changed',
    'tax_provider_unavailable',
    'missing_shipping_method',
    'invalid_shipping_address',
    'empty_cart',
    'timeout',
]);

const isWalletTokenInvalidationError = (error: unknown): boolean => {
    if (!error) {
        return false;
    }

    if (
        typeof error === 'object' &&
        'type' in error &&
        typeof error.type === 'string' &&
        WALLET_TOKEN_INVALIDATION_IGNORED_ERROR_TYPES.has(error.type)
    ) {
        return false;
    }

    return true;
};

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

    const {
        selectedState: { submitOrderError, finalizeOrderError },
    } = useCheckout(({ errors }) => ({
        submitOrderError: errors.getSubmitOrderError(),
        finalizeOrderError: errors.getFinalizeOrderError(),
    }));

    const {
        selectedState: { checkoutSettings },
    } = useCheckout(({ data }) => ({
        checkoutSettings: data.getConfig()?.checkoutSettings,
    }));

    const isHandleUnsuccessful3dsCheckExperimentOn =
        method.method === PaymentMethodType.GooglePay &&
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
    const [declinedNonce, setDeclinedNonce] = useState<string>();

    useEffect(() => {
        if (
            isHandleUnsuccessful3dsCheckExperimentOn &&
            (isWalletTokenInvalidationError(submitOrderError) ||
                isWalletTokenInvalidationError(finalizeOrderError))
        ) {
            setDeclinedNonce(currentNonce);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submitOrderError, finalizeOrderError]);

    const hasDeclinedPaymentData = declinedNonce !== undefined && declinedNonce === currentNonce;

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
