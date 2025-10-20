import {
    type EmbeddedCheckoutMessenger,
    type EmbeddedCheckoutMessengerOptions,
} from '@bigcommerce/checkout-sdk';
import React, {  type ReactElement, useEffect, useRef, useState } from 'react';

import { useAnalytics } from '@bigcommerce/checkout/contexts';
import { type ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
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

import { OrderConfirmationPage } from './OrderConfirmationPage';

export interface OrderConfirmationProps {
    containerId: string;
    embeddedStylesheet: EmbeddedCheckoutStylesheet;
    errorLogger: ErrorLogger;
    orderId: number;
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

    useEffect(() => {
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
    }, []);

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
