import { createCheckoutService, createEmbeddedCheckoutMessenger } from '@bigcommerce/checkout-sdk';
import { createRequestSender } from '@bigcommerce/request-sender';
import React, { Component } from 'react';
import ReactModal from 'react-modal';

import { StepTrackerFactory } from '../analytics';
import { ErrorLoggerFactory, ErrorLoggingBoundary } from '../common/error';
import { NewsletterService } from '../customer';
import { createEmbeddedCheckoutStylesheet, createEmbeddedCheckoutSupport } from '../embeddedCheckout';
import { getLanguageService, LocaleProvider } from '../locale';
import { FlashMessage } from '../ui/alert';

import Checkout from './Checkout';
import CheckoutProvider from './CheckoutProvider';

export interface CheckoutAppProps {
    checkoutId: string;
    containerId: string;
    flashMessages: FlashMessage[]; // TODO: Expose flash messages from SDK
}

export default class CheckoutApp extends Component<CheckoutAppProps> {
    private checkoutService = createCheckoutService({
        locale: getLanguageService().getLocale(),
        shouldWarnMutation: process.env.NODE_ENV === 'development',
    });
    private embeddedSupport = createEmbeddedCheckoutSupport(getLanguageService());
    private embeddedStylesheet = createEmbeddedCheckoutStylesheet();
    private errorLogger = new ErrorLoggerFactory().getLogger();
    private newsletterService = new NewsletterService(createRequestSender());
    private stepTrackerFactory = new StepTrackerFactory(this.checkoutService);

    componentDidMount(): void {
        const { containerId } = this.props;

        ReactModal.setAppElement(`#${containerId}`);
    }

    render() {
        return (
            <ErrorLoggingBoundary logger={ this.errorLogger }>
                <LocaleProvider checkoutService={ this.checkoutService }>
                    <CheckoutProvider checkoutService={ this.checkoutService }>
                        <Checkout
                            { ...this.props }
                            createEmbeddedMessenger={ createEmbeddedCheckoutMessenger }
                            createStepTracker={ () => this.stepTrackerFactory.createTracker() }
                            embeddedStylesheet={ this.embeddedStylesheet }
                            embeddedSupport={ this.embeddedSupport }
                            errorLogger={ this.errorLogger }
                            subscribeToNewsletter={ data => this.newsletterService.subscribe(data) }
                        />
                    </CheckoutProvider>
                </LocaleProvider>
            </ErrorLoggingBoundary>
        );
    }
}
