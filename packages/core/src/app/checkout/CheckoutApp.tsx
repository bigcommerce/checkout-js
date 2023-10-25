/* eslint-disable */
// @ts-nocheck
import { createCheckoutService, createEmbeddedCheckoutMessenger } from '@bigcommerce/checkout-sdk';
import { BrowserOptions } from '@sentry/browser';
import React, { Component } from 'react';
import ReactModal from 'react-modal';
import RecurlyProvider from "../recurly/RecurlyProvider";
import { AnalyticsProvider } from '@bigcommerce/checkout/analytics';
import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { ErrorBoundary, ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { getLanguageService, LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

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

export default class CheckoutApp extends Component<CheckoutAppProps> {
    private checkoutService = createCheckoutService({
        locale: getLanguageService().getLocale(),
        shouldWarnMutation: process.env.NODE_ENV === 'development',
    });
    private embeddedStylesheet = createEmbeddedCheckoutStylesheet();
    private embeddedSupport = createEmbeddedCheckoutSupport(getLanguageService());
    private errorLogger: ErrorLogger;

    constructor(props: Readonly<CheckoutAppProps>) {
        super(props);

        this.errorLogger = createErrorLogger(
            { sentry: props.sentryConfig },
            {
                errorTypes: ['UnrecoverableError'],
                publicPath: props.publicPath,
                sampleRate: props.sentrySampleRate ? props.sentrySampleRate : 0.1,
            },
        );
    }

    componentDidMount(): void {
        const { containerId } = this.props;

        ReactModal.setAppElement(`#${containerId}`);

        const initGTM = () => {
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://gtmss.mitoq.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-98LH');
        }

        setTimeout(initGTM, 5000);
    }

    render() {
        return (
            <ErrorBoundary logger={this.errorLogger}>
                <LocaleProvider checkoutService={this.checkoutService}>
                    <CheckoutProvider checkoutService={this.checkoutService}>
                        <RecurlyProvider>
                        <AnalyticsProvider checkoutService={this.checkoutService}>
                            <ExtensionProvider checkoutService={this.checkoutService}>
                                <Checkout
                                    {...this.props}
                                    createEmbeddedMessenger={createEmbeddedCheckoutMessenger}
                                    embeddedStylesheet={this.embeddedStylesheet}
                                    embeddedSupport={this.embeddedSupport}
                                    errorLogger={this.errorLogger}
                                />
                            </ExtensionProvider>
                        </AnalyticsProvider>
                        </RecurlyProvider>
                    </CheckoutProvider>
                </LocaleProvider>
            </ErrorBoundary>
        );
    }
}
