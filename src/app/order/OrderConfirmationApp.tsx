import { createEmbeddedCheckoutMessenger } from '@bigcommerce/checkout-sdk';
import React, { Component, ReactNode } from 'react';
import ReactModal from 'react-modal';

import { StepTrackerFactory } from '../analytics';
import { getCheckoutService, CheckoutProvider } from '../checkout';
import { ErrorLoggerFactory, ErrorLoggingBoundary } from '../common/error';
import { createEmbeddedCheckoutStylesheet } from '../embeddedCheckout';
import { AccountService, CreatedCustomer } from '../guestSignup';
import { SignUpFormValues } from '../guestSignup/GuestSignUpForm';
import { LocaleProvider } from '../locale';

import OrderConfirmation from './OrderConfirmation';

export interface OrderConfirmationAppProps {
    orderId: number;
    containerId: string;
}

class OrderConfirmationApp extends Component<OrderConfirmationAppProps> {
    private accountService = new AccountService();
    private checkoutService = getCheckoutService();
    private embeddedStylesheet = createEmbeddedCheckoutStylesheet();
    private errorLogger = new ErrorLoggerFactory().getLogger();
    private stepTrackerFactory = new StepTrackerFactory(this.checkoutService);

    componentDidMount(): void {
        const { containerId } = this.props;

        ReactModal.setAppElement(`#${containerId}`);
    }

    render(): ReactNode {
        return (
            <ErrorLoggingBoundary logger={ this.errorLogger }>
                <LocaleProvider checkoutService={ this.checkoutService }>
                    <CheckoutProvider checkoutService={ this.checkoutService }>
                        <OrderConfirmation
                            { ...this.props }
                            createAccount={ values => this.createAccount(values) }
                            createEmbeddedMessenger={ createEmbeddedCheckoutMessenger }
                            createStepTracker={ () => this.stepTrackerFactory.createTracker() }
                            embeddedStylesheet={ this.embeddedStylesheet }
                            errorLogger={ this.errorLogger }
                        />
                    </CheckoutProvider>
                </LocaleProvider>
            </ErrorLoggingBoundary>
        );
    }

    private createAccount({
        password,
        confirmPassword,
    }: SignUpFormValues): Promise<CreatedCustomer> {
        const { orderId } = this.props;

        return this.accountService.create({
            orderId,
            newsletter: false,
            password,
            confirmPassword,
        });
    }
}

export default OrderConfirmationApp;
