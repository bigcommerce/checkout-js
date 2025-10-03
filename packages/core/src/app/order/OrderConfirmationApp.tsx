import { createCheckoutService, createEmbeddedCheckoutMessenger } from '@bigcommerce/checkout-sdk';
import type { BrowserOptions } from '@sentry/browser';
import React, { useCallback, useEffect, useMemo } from 'react';
import ReactModal from 'react-modal';

import { AnalyticsProvider } from '@bigcommerce/checkout/analytics';
import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { ErrorBoundary } from '@bigcommerce/checkout/error-handling-utils';
import { getLanguageService, LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { ThemeProvider } from '@bigcommerce/checkout/ui';

import '../../scss/App.scss';

import { createErrorLogger } from '../common/error';
import { createEmbeddedCheckoutStylesheet } from '../embeddedCheckout';
import { AccountService, type CreatedCustomer, type SignUpFormValues } from '../guestSignup';

import { OrderConfirmation } from './OrderConfirmation';

export interface OrderConfirmationAppProps {
    containerId: string;
    orderId: number;
    publicPath?: string;
    sentryConfig?: BrowserOptions;
    sentrySampleRate?: number;
}

const OrderConfirmationApp: React.FC<OrderConfirmationAppProps> = ({
    containerId,
    orderId,
    publicPath,
    sentryConfig,
    sentrySampleRate,
}) => {
    const accountService = useMemo(() => new AccountService(), []);
    const errorLogger = useMemo(() => createErrorLogger(
        { sentry: sentryConfig },
        {
            errorTypes: ['UnrecoverableError'],
            publicPath,
            sampleRate: sentrySampleRate || 0.1,
        },
    ), []);
    const checkoutService = useMemo(() => createCheckoutService({
        locale: getLanguageService().getLocale(),
        shouldWarnMutation: process.env.NODE_ENV === 'development',
        errorLogger,
    }), []);
    const embeddedStylesheet = useMemo(() => createEmbeddedCheckoutStylesheet(), []);

    useEffect(() => {
        ReactModal.setAppElement(`#${containerId}`);
    }, []);

    const createAccount = useCallback(
        ({ password, confirmPassword }: SignUpFormValues): Promise<CreatedCustomer> => {
            return accountService.create({
                orderId,
                newsletter: false,
                password,
                confirmPassword,
            });
        },
        [accountService, orderId],
    );

    return (
        <ErrorBoundary logger={errorLogger}>
            <LocaleProvider checkoutService={checkoutService}>
                <CheckoutProvider checkoutService={checkoutService}>
                    <AnalyticsProvider checkoutService={checkoutService}>
                        <ExtensionProvider checkoutService={checkoutService} errorLogger={createErrorLogger()}>
                            <ThemeProvider>
                                <OrderConfirmation
                                    containerId={containerId}
                                    createAccount={createAccount}
                                    createEmbeddedMessenger={createEmbeddedCheckoutMessenger}
                                    embeddedStylesheet={embeddedStylesheet}
                                    errorLogger={errorLogger}
                                    orderId={orderId}
                                />
                            </ThemeProvider>
                        </ExtensionProvider>
                    </AnalyticsProvider>
                </CheckoutProvider>
            </LocaleProvider>
        </ErrorBoundary>
    );
};

export default OrderConfirmationApp;
