import { CheckoutSelectors, PaymentInitializeOptions, PaymentMethod, PaymentRequestOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { LoadingOverlay } from '../../ui/loading';

export interface HostedPaymentMethodProps {
    description?: ReactNode;
    isInitializing?: boolean;
    method: PaymentMethod;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
}

export default class HostedPaymentMethod extends Component<HostedPaymentMethodProps> {
    async componentDidMount(): Promise<void> {
        const {
            initializePayment,
            method,
            onUnhandledError = noop,
        } = this.props;

        try {
            await initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    async componentWillUnmount(): Promise<void> {
        const {
            deinitializePayment,
            method,
            onUnhandledError = noop,
        } = this.props;

        try {
            await deinitializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    render(): ReactNode {
        const {
            description,
            isInitializing = false,
        } = this.props;

        if (!description) {
            return null;
        }

        return (
            <LoadingOverlay
                hideContentWhenLoading
                isLoading={ isInitializing }
            >
                { description && <div className="paymentMethod paymentMethod--hosted">
                    { description }
                </div> }
            </LoadingOverlay>
        );
    }
}
