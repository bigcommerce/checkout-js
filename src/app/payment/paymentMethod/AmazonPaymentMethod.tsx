import { CheckoutSelectors, CustomerInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export interface AmazonPaymentMethodProps extends Omit<HostedWidgetPaymentMethodProps, 'containerId' | 'hideContentWhenSignedOut' | 'isSignInRequired' | 'signInCustomer'> {
    initializeCustomer(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
}

function signInAmazon() {
    const button: HTMLElement | null = document.querySelector('#paymentWidget img');

    if (button) {
        button.click();
    }
}

const AmazonPaymentMethod: FunctionComponent<AmazonPaymentMethodProps> = ({
    initializeCustomer,
    initializePayment,
    onUnhandledError,
    ...rest
}) => (
    <HostedWidgetPaymentMethod
        { ...rest }
        containerId="paymentWidget"
        hideContentWhenSignedOut
        initializeCustomer={ options => initializeCustomer({
            ...options,
            amazon: {
                container: 'paymentWidget',
                onError: onUnhandledError,
            },
        }) }
        initializePayment={ options => initializePayment({
            ...options,
            amazon: {
                container: 'paymentWidget',
                onError: onUnhandledError,
            },
        }) }
        isSignInRequired={ true }
        signInCustomer={ signInAmazon }
    />
);

export default AmazonPaymentMethod;
