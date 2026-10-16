import {
    type EmbeddedCheckoutMessenger,
    type EmbeddedCheckoutMessengerOptions,
} from '@bigcommerce/checkout-sdk';
import { createRequestSender } from '@bigcommerce/request-sender';
import React, { type ReactElement, useEffect, useRef, useState } from 'react';

import { useAnalytics, useCheckout } from '@bigcommerce/checkout/contexts';
import { ErrorLevelType, type ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { OrderConfirmationPageSkeleton } from '@bigcommerce/checkout/ui';
import { CannotCreatePersonalAccountSessionStorage } from '@bigcommerce/checkout/utility';

import { type EmbeddedCheckoutStylesheet } from '../../embeddedCheckout';
import { type CreatedCustomer, type SignUpFormValues } from '../../guestSignup';
import {
    AccountCreationFailedError,
    AccountCreationRequirementsError,
} from '../../guestSignup/errors';
import getPaymentInstructions from '../getPaymentInstructions';

import { ExpiredPermalinkView } from './ExpiredPermalinkView';
import { OrderConfirmationPage } from './OrderConfirmationPage';
import { RateLimitedPermalinkView } from './RateLimitedPermalinkView';
import { waitForOrderCompletion } from './waitForOrderCompletion';

const requestSender = createRequestSender();

export enum OrderPermalinkStatus {
    Valid = 'valid',
    Expired = 'expired',
    RateLimited = 'rate_limited',
}

export interface OrderConfirmationProps {
    containerId: string;
    embeddedStylesheet: EmbeddedCheckoutStylesheet;
    errorLogger: ErrorLogger;
    orderId: number;
    permalinkStatus?: OrderPermalinkStatus | null;
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
    permalinkStatus,
}: OrderConfirmationProps): ReactElement => {
    const [error, setError] = useState<Error | undefined>();
    const [hasSignedUp, setHasSignedUp] = useState<boolean | undefined>();
    const [isSigningUp, setIsSigningUp] = useState<boolean | undefined>();

    const embeddedMessengerRef = useRef<EmbeddedCheckoutMessenger | undefined>();
    const hasTrackedPurchaseRef = useRef(false);

    const {
        selectedState: { order, config },
        checkoutService: { loadOrder },
    } = useCheckout(({ data }) => ({
        order: data.getOrder(),
        config: data.getConfig(),
    }));
    const { analyticsTracker } = useAnalytics();
    const [cannotCreatePersonalAccount, setCannotCreatePersonalAccount] = useState(false);

    useEffect(() => {
        setCannotCreatePersonalAccount(
            CannotCreatePersonalAccountSessionStorage.getCannotCreatePersonalAccount(),
        );
        CannotCreatePersonalAccountSessionStorage.removeCannotCreatePersonalAccount();
    }, []);

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
            (shopperConfig &&
                shopperConfig.passwordRequirements &&
                shopperConfig.passwordRequirements.error) ||
            '';

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
        const urlParams = new URLSearchParams(window.location.search);
        const orderToken = urlParams.get('orderToken');

        if (!orderToken) {
            throw new Error('Missing orderToken query parameter');
        }

        await requestSender.post('/api/storefront/orders/regenerate-permalink', {
            body: { orderToken },
        });
    };

    useEffect(() => {
        if (
            permalinkStatus === OrderPermalinkStatus.Expired ||
            permalinkStatus === OrderPermalinkStatus.RateLimited
        ) {
            return;
        }

        let cancelled = false;

        const loadOrderAndTrackPurchase = async () => {
            try {
                const state = await loadOrder(orderId);
                const { links: { siteLink = '' } = {} } = state.data.getConfig() || {};
                const messenger = createEmbeddedMessenger({ parentOrigin: siteLink });

                embeddedMessengerRef.current = messenger;
                messenger.receiveStyles((styles) => embeddedStylesheet.append(styles));
                messenger.postFrameLoaded({ contentId: containerId });

                const isComplete = await waitForOrderCompletion({
                    initialState: state,
                    orderId,
                    isCancelled: () => cancelled,
                    loadOrder,
                });

                if (cancelled) {
                    return;
                }

                if (!isComplete) {
                    errorLogger.log(
                        new Error('Order was not complete after retrying, purchase not tracked'),
                        { errorCode: 'orderIncompleteAfterRetries' },
                        ErrorLevelType.Warning,
                        { orderId },
                    );

                    return;
                }

                if (!hasTrackedPurchaseRef.current) {
                    hasTrackedPurchaseRef.current = true;
                    analyticsTracker.orderPurchased();
                }
            } catch (e) {
                handleUnhandledError(e instanceof Error ? e : new Error(String(e)));
            }
        };

        void loadOrderAndTrackPurchase();

        return () => {
            cancelled = true;
        };
    }, [permalinkStatus]);

    if (permalinkStatus === OrderPermalinkStatus.Expired) {
        return <ExpiredPermalinkView onResendClick={handleResendGuestToken} />;
    }

    if (permalinkStatus === OrderPermalinkStatus.RateLimited) {
        return <RateLimitedPermalinkView />;
    }

    if (!order || !config) {
        return <OrderConfirmationPageSkeleton />;
    }

    const paymentInstructions = getPaymentInstructions(order);
    const {
        currency,
        shopperConfig,
        shopperCurrency,
        storeProfile: { orderEmail, storePhoneNumber },
        links: { siteLink },
    } = config;
    const shouldShowPasswordForm = order.customerCanBeCreated;
    const customerCanBeCreated = !order.customerId;

    return (
        <OrderConfirmationPage
            cannotCreatePersonalAccount={cannotCreatePersonalAccount}
            currency={currency}
            customerCanBeCreated={customerCanBeCreated}
            error={error}
            hasSignedUp={hasSignedUp}
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
