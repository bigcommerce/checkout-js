import {
    type EmbeddedCheckoutMessenger,
    type EmbeddedCheckoutMessengerOptions,
} from '@bigcommerce/checkout-sdk';
import { createRequestSender } from '@bigcommerce/request-sender';
import React, { type ReactElement, useEffect, useRef, useState } from 'react';

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

import { ExpiredPermalinkView } from './ExpiredPermalinkView';
import { OrderConfirmationPage } from './OrderConfirmationPage';
import { RateLimitedPermalinkView } from './RateLimitedPermalinkView';

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
        if (permalinkStatus === OrderPermalinkStatus.Expired || permalinkStatus === OrderPermalinkStatus.RateLimited) {
            return;
        }

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
    }, [permalinkStatus]);

    if (permalinkStatus === OrderPermalinkStatus.Expired) {
        return <ExpiredPermalinkView onResendClick={handleResendGuestToken} />;
    }

    if (permalinkStatus === OrderPermalinkStatus.RateLimited) {
        return <RateLimitedPermalinkView />;
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
