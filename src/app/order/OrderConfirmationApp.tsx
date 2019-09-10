import { createCheckoutService, createEmbeddedCheckoutMessenger } from '@bigcommerce/checkout-sdk';
import { BrowserOptions } from '@sentry/browser';
import React, { Component, ReactNode } from 'react';
import ReactModal from 'react-modal';

import '../../scss/App.scss';
import { StepTracker, StepTrackerFactory } from '../analytics';
import { CheckoutProvider } from '../checkout';
import { createErrorLogger, ErrorBoundary, ErrorLogger } from '../common/error';
import { createEmbeddedCheckoutStylesheet } from '../embeddedCheckout';
import { AccountService, CreatedCustomer, SignUpFormValues } from '../guestSignup';
import { getLanguageService, LocaleProvider } from '../locale';

import OrderConfirmation from './OrderConfirmation';

export interface OrderConfirmationAppProps {
    containerId: string;
    orderId: number;
    sentryConfig?: BrowserOptions;
}

class OrderConfirmationApp extends Component<OrderConfirmationAppProps> {
    private accountService = new AccountService();
    private checkoutService = createCheckoutService({
        locale: getLanguageService().getLocale(),
        shouldWarnMutation: process.env.NODE_ENV === 'development',
    });
    private embeddedStylesheet = createEmbeddedCheckoutStylesheet();
    private errorLogger: ErrorLogger;
    private stepTrackerFactory = new StepTrackerFactory(this.checkoutService);

    constructor(props: Readonly<OrderConfirmationAppProps>) {
        super(props);

        this.errorLogger = createErrorLogger(
            { sentry: props.sentryConfig },
            { errorTypes: ['UnrecoverableError'] }
        );
    }

    componentDidMount(): void {
        const { containerId } = this.props;

        ReactModal.setAppElement(`#${containerId}`);
    }

    render(): ReactNode {
        return (
            <ErrorBoundary logger={ this.errorLogger }>
                <LocaleProvider checkoutService={ this.checkoutService }>
                    <CheckoutProvider checkoutService={ this.checkoutService }>
                        <OrderConfirmation
                            { ...this.props }
                            createAccount={ this.createAccount }
                            createEmbeddedMessenger={ createEmbeddedCheckoutMessenger }
                            createStepTracker={ this.createStepTracker }
                            embeddedStylesheet={ this.embeddedStylesheet }
                            errorLogger={ this.errorLogger }
                        />
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

    private createStepTracker: () => StepTracker = () => {
        return this.stepTrackerFactory.createTracker();
    };
}

export default OrderConfirmationApp;
