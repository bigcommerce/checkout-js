/* eslint-disable */
// @ts-nocheck
import { createCheckoutService, createEmbeddedCheckoutMessenger } from '@bigcommerce/checkout-sdk';
import { BrowserOptions } from '@sentry/browser';
import React, { Component } from 'react';
import ReactModal from 'react-modal';
import RecurlyProvider from "../recurly/RecurlyProvider";
import { AnalyticsProvider } from '@bigcommerce/checkout/analytics';

import '../../scss/App.scss';
import { createErrorLogger, ErrorBoundary, ErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';
import { getLanguageService, LocaleProvider } from '../locale';

import Checkout from './Checkout';
import CheckoutProvider from './CheckoutProvider';

export interface CheckoutAppProps {
    checkoutId: string;
    containerId: string;
    publicPath?: string;
    sentryConfig?: BrowserOptions;
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

        setTimeout(initGTM, 5);
    }

    render() {
        return (
            <ErrorBoundary logger={ this.errorLogger }>
                <LocaleProvider checkoutService={ this.checkoutService }>
                    <CheckoutProvider checkoutService={ this.checkoutService }>
                        <RecurlyProvider>
                        <AnalyticsProvider checkoutService={ this.checkoutService }>
                            <Checkout
                                {...this.props}
                                createEmbeddedMessenger={createEmbeddedCheckoutMessenger}
                                embeddedStylesheet={this.embeddedStylesheet}
                                embeddedSupport={this.embeddedSupport}
                                errorLogger={this.errorLogger}
                            />
                        </AnalyticsProvider>
                        </RecurlyProvider>
                    </CheckoutProvider>
                </LocaleProvider>
            </ErrorBoundary>
        );
    }
}
