import { createCheckoutService, createEmbeddedCheckoutMessenger } from '@bigcommerce/checkout-sdk';
import type { BrowserOptions } from '@sentry/browser';
import React, { type ReactElement, useEffect, useMemo } from 'react';
import ReactModal from 'react-modal';

import { AnalyticsProvider } from '@bigcommerce/checkout/analytics';
import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { ErrorBoundary } from '@bigcommerce/checkout/error-handling-utils';
import { getLanguageService, LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { ThemeProvider } from '@bigcommerce/checkout/ui';

import '../../scss/App.scss';

import { createErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

import Checkout from './Checkout';

export interface CheckoutAppProps {
    checkoutId: string;
    containerId: string;
    publicPath?: string;
    sentryConfig?: BrowserOptions;
    sentrySampleRate?: number;
}

const CheckoutApp = (props: CheckoutAppProps): ReactElement => {
    const { containerId, sentryConfig, publicPath, sentrySampleRate } = props;

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
    const embeddedSupport = useMemo(() => createEmbeddedCheckoutSupport(getLanguageService()), []);

    useEffect(() => {
        ReactModal.setAppElement(`#${containerId}`);
    }, []);

    return (
        <ErrorBoundary logger={errorLogger}>
            <LocaleProvider checkoutService={checkoutService}>
                <CheckoutProvider checkoutService={checkoutService}>
                    <AnalyticsProvider checkoutService={checkoutService}>
                        <ExtensionProvider
                            checkoutService={checkoutService}
                            errorLogger={createErrorLogger()}
                        >
                            <ThemeProvider>
                                <Checkout
                                    {...props}
                                    createEmbeddedMessenger={createEmbeddedCheckoutMessenger}
                                    embeddedStylesheet={embeddedStylesheet}
                                    embeddedSupport={embeddedSupport}
                                    errorLogger={errorLogger}
                                />
                            </ThemeProvider>
                        </ExtensionProvider>
                    </AnalyticsProvider>
                </CheckoutProvider>
            </LocaleProvider>
        </ErrorBoundary>
    );
};

export default CheckoutApp;
