import {
    type EmbeddedCheckoutMessenger,
    type EmbeddedCheckoutMessengerOptions,
} from '@bigcommerce/checkout-sdk';
import React, {  type ReactElement, useEffect, useRef, useState } from 'react';

import { useAnalytics, useCheckout } from '@bigcommerce/checkout/contexts';
import { type ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { OrderConfirmationPageSkeleton } from '@bigcommerce/checkout/ui';

import { isExperimentEnabled } from '../../common/utility';
import { type EmbeddedCheckoutStylesheet } from '../../embeddedCheckout';
import {
    type CreatedCustomer,
    type SignUpFormValues,
} from '../../guestSignup';
import {
    AccountCreationFailedError,
    AccountCreationRequirementsError,
} from '../../guestSignup/errors';
import getPaymentInstructions from '../getPaymentInstructions';

import { ExpiredTokenView } from './ExpiredTokenView';
import { OrderConfirmationPage } from './OrderConfirmationPage';

export interface OrderConfirmationProps {
    containerId: string;
    embeddedStylesheet: EmbeddedCheckoutStylesheet;
    errorLogger: ErrorLogger;
    orderId: number;
    guestTokenValidation?: 'valid' | 'expired' | 'invalid' | 'missing';
    expiredToken?: boolean;
    createAccount(values: SignUpFormValues): Promise<CreatedCustomer>;
    createEmbeddedMessenger(options: EmbeddedCheckoutMessengerOptions): EmbeddedCheckoutMessenger;
}

export const OrderConfirmation = ({
    containerId,
    createAccount,
    createEmbeddedMessenger,
    embeddedStylesheet,
    orderId,
    errorLogger,
    guestTokenValidation,
    expiredToken,
}: OrderConfirmationProps): ReactElement => {
    const [error, setError] = useState<Error | undefined>();
    const [hasSignedUp, setHasSignedUp] = useState<boolean | undefined>();
    const [isSigningUp, setIsSigningUp] = useState<boolean | undefined>();

    const embeddedMessengerRef = useRef<EmbeddedCheckoutMessenger | undefined>();

    const {
        checkoutState: {
            data: { getOrder, getConfig },
            statuses: { isLoadingOrder },
        },
        checkoutService: {
            loadOrder,
        },
    } = useCheckout();
    const { analyticsTracker } = useAnalytics();

    const config = getConfig();
    const order = getOrder();

    const handleUnhandledError = (e: Error) => {
        setError(e);
        errorLogger.log(e);

        if (embeddedMessengerRef.current) {
            embeddedMessengerRef.current.postError(e);
        }
    };

    const handleErrorModalClose = () => {
        setError(undefined);
    };

    const handleSignUp = ({ password, confirmPassword }: SignUpFormValues) => {
        const shopperConfig = config && config.shopperConfig;
        const passwordRequirements =
            (shopperConfig && shopperConfig.passwordRequirements && shopperConfig.passwordRequirements.error) || '';

        setIsSigningUp(true);

        createAccount({ password, confirmPassword })
            .then(() => {
                setHasSignedUp(true);
                setIsSigningUp(false);
            })
            .catch((err) => {
                setError(
                    err.status < 500
                        ? new AccountCreationRequirementsError(err, passwordRequirements)
                        : new AccountCreationFailedError(err),
                );
                setHasSignedUp(false);
                setIsSigningUp(false);
            });
    };

    const handleResendGuestToken = async (): Promise<void> => {
        // Extract token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            throw new Error('No token found in URL');
        }

        // Call regeneration endpoint
        const response = await fetch('/api/storefront/orders/' + orderId + '/guest-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                old_token: token,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to regenerate token');
        }
    };

    useEffect(() => {
        console.log('[OrderConfirmation] useEffect - expiredToken:', expiredToken, 'guestTokenValidation:', guestTokenValidation);

        // If server redirected to expired token page, don't make API call
        if (expiredToken || guestTokenValidation === 'expired') {
            console.log('[OrderConfirmation] Skipping loadOrder - token is expired');
            return;
        }

        console.log('[OrderConfirmation] Loading order:', orderId);
        loadOrder(orderId)
            .then(({ data }) => {
                const { links: { siteLink = '' } = {} } = data.getConfig() || {};
                const messenger = createEmbeddedMessenger({ parentOrigin: siteLink });

                embeddedMessengerRef.current = messenger;
                messenger.receiveStyles((styles) => embeddedStylesheet.append(styles));
                messenger.postFrameLoaded({ contentId: containerId });
                analyticsTracker.orderPurchased();
            })
            .catch(handleUnhandledError);
    }, [expiredToken, guestTokenValidation]);

    // Show expired token view immediately if server redirected to expired page
    // This is the cleanest path - dedicated endpoint for expired tokens
    if (expiredToken) {
        return <ExpiredTokenView orderId={orderId} onResendClick={handleResendGuestToken} />;
    }

    // Legacy: also check guestTokenValidation from seeded data (for backward compatibility)
    if (guestTokenValidation === 'expired') {
        return <ExpiredTokenView orderId={orderId} onResendClick={handleResendGuestToken} />;
    }

    if (!order || !config || isLoadingOrder()) {
        return <OrderConfirmationPageSkeleton />;
    }

    // Legacy check: also handle expired state from API response (for backward compatibility)
    if ((order as any).guestTokenValidation === 'expired') {
        return <ExpiredTokenView orderId={orderId} onResendClick={handleResendGuestToken} />;
    }

    const paymentInstructions = getPaymentInstructions(order);
    const {
        checkoutSettings,
        currency,
        shopperConfig,
        shopperCurrency,
        storeProfile: { orderEmail, storePhoneNumber },
        links: { siteLink },
    } = config;
    const shouldShowPasswordForm = order.customerCanBeCreated;
    const customerCanBeCreated = !order.customerId;
    const isShippingDiscountDisplayEnabled = isExperimentEnabled(
        checkoutSettings,
        'PROJECT-6643.enable_shipping_discounts_in_orders',
    );

    return (
        <OrderConfirmationPage
            config={config}
            currency={currency}
            customerCanBeCreated={customerCanBeCreated}
            error={error}
            hasSignedUp={hasSignedUp}
            isShippingDiscountDisplayEnabled={isShippingDiscountDisplayEnabled}
            isSigningUp={isSigningUp}
            onErrorModalClose={handleErrorModalClose}
            onSignUp={handleSignUp}
            order={order}
            paymentInstructions={paymentInstructions}
            shopperConfig={shopperConfig}
            shopperCurrency={shopperCurrency}
            shouldShowPasswordForm={shouldShowPasswordForm}
            siteLink={siteLink}
            supportEmail={orderEmail}
            supportPhoneNumber={storePhoneNumber}
        />
    );
};
