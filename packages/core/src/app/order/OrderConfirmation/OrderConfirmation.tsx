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
    guestTokenValidation?: 'valid' | 'expired' | null;
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
        // Extract order token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const orderToken = urlParams.get('orderToken'); // Order's permanent token

        if (!orderToken) {
            throw new Error('No order token found in URL');
        }

        // Call regeneration endpoint with order ID in path and order token as query param
        // This matches the pattern of the order confirmation page URL
        const response = await fetch(`/api/storefront/orders/${orderId}/guest-token?orderToken=${encodeURIComponent(orderToken)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to regenerate token');
        }
    };

    useEffect(() => {
        console.log('[OrderConfirmation] useEffect - guestTokenValidation:', guestTokenValidation);

        // If token is expired, don't make API call - show expired view instead
        if (guestTokenValidation === 'expired') {
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
    }, [guestTokenValidation]);

    // Show expired token view if detected from seeded data
    if (guestTokenValidation === 'expired') {
        return <ExpiredTokenView orderId={orderId} onResendClick={handleResendGuestToken} />;
    }

    if (!order || !config || isLoadingOrder()) {
        return <OrderConfirmationPageSkeleton />;
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
