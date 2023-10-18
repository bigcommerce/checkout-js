import { createCheckoutService, createEmbeddedCheckoutMessenger } from '@bigcommerce/checkout-sdk';
import { BrowserOptions } from '@sentry/browser';
import React, { Component, ReactNode } from 'react';
import ReactModal from 'react-modal';

import { AnalyticsProvider } from '@bigcommerce/checkout/analytics';
import '../../scss/App.scss';
import { ErrorBoundary, ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { getLanguageService, LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { createErrorLogger } from '../common/error';
import { createEmbeddedCheckoutStylesheet } from '../embeddedCheckout';
import { AccountService, CreatedCustomer, SignUpFormValues } from '../guestSignup';

import OrderConfirmation from './OrderConfirmation';

export interface OrderConfirmationAppProps {
    containerId: string;
    orderId: number;
    publicPath?: string;
    sentryConfig?: BrowserOptions;
    sentrySampleRate?: number;
}

class OrderConfirmationApp extends Component<OrderConfirmationAppProps> {
    private accountService = new AccountService();
    private checkoutService = createCheckoutService({
        locale: getLanguageService().getLocale(),
        shouldWarnMutation: process.env.NODE_ENV === 'development',
    });
    private embeddedStylesheet = createEmbeddedCheckoutStylesheet();
    private errorLogger: ErrorLogger;

    constructor(props: Readonly<OrderConfirmationAppProps>) {
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
    }

    render(): ReactNode {
        return (
            <ErrorBoundary logger={this.errorLogger}>
                <LocaleProvider checkoutService={this.checkoutService}>
                    <CheckoutProvider checkoutService={this.checkoutService}>
                        <AnalyticsProvider checkoutService={ this.checkoutService }>
                            <OrderConfirmation
                                {...this.props}
                                createAccount={this.createAccount}
                                createEmbeddedMessenger={createEmbeddedCheckoutMessenger}
                                embeddedStylesheet={this.embeddedStylesheet}
                                errorLogger={this.errorLogger}
                            />
                        </AnalyticsProvider>
                    </CheckoutProvider>
                </LocaleProvider>
            </ErrorBoundary>
        );
    }

    private createAccount: (values: SignUpFormValues) => Promise<CreatedCustomer> = ({
        password,
        confirmPassword,
    }) => {
        const { orderId } = this.props;

        return this.accountService.create({
            orderId,
            newsletter: false,
            password,
            confirmPassword,
        });
    };
}

export default OrderConfirmationApp;
