import { createCheckoutService, createEmbeddedCheckoutMessenger } from '@bigcommerce/checkout-sdk';
import { BrowserOptions } from '@sentry/browser';
import React, { Component, ReactNode } from 'react';
import ReactModal from 'react-modal';

import { AnalyticsProvider } from '@bigcommerce/checkout/analytics';
import '../../scss/App.scss';
import { getLanguageService, LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { createEmbeddedCheckoutStylesheet } from '../embeddedCheckout';
import { AccountService, CreatedCustomer, SignUpFormValues } from '../guestSignup';

import OrderConfirmation from './OrderConfirmation';

export interface OrderConfirmationAppProps {
    containerId: string;
    orderId: number;
    publicPath?: string;
    sentryConfig?: BrowserOptions;
}

class OrderConfirmationApp extends Component<OrderConfirmationAppProps> {
    private accountService = new AccountService();
    private checkoutService = createCheckoutService({
        locale: getLanguageService().getLocale(),
        shouldWarnMutation: process.env.NODE_ENV === 'development',
    });
    private embeddedStylesheet = createEmbeddedCheckoutStylesheet();

    componentDidMount(): void {
        const { containerId } = this.props;

        ReactModal.setAppElement(`#${containerId}`);
    }

    render(): ReactNode {
        return (
            <LocaleProvider checkoutService={this.checkoutService}>
                <CheckoutProvider checkoutService={this.checkoutService}>
                    <AnalyticsProvider checkoutService={this.checkoutService}>
                        <OrderConfirmation
                            {...this.props}
                            createAccount={this.createAccount}
                            createEmbeddedMessenger={createEmbeddedCheckoutMessenger}
                            embeddedStylesheet={this.embeddedStylesheet}
                        />
                    </AnalyticsProvider>
                </CheckoutProvider>
            </LocaleProvider>
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
