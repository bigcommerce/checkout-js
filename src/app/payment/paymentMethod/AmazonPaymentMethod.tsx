import { CheckoutSelectors, CustomerInitializeOptions, PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';
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
}) => {
    const initializeAmazonCustomer = useCallback((options: CustomerInitializeOptions) => initializeCustomer({
        ...options,
        amazon: {
            container: 'paymentWidget',
            onError: onUnhandledError,
        },
    }), [initializeCustomer, onUnhandledError]);

    const initializeAmazonPayment = useCallback((options: PaymentInitializeOptions) => initializePayment({
        ...options,
        amazon: {
            container: 'paymentWidget',
            onError: onUnhandledError,
        },
    }), [initializePayment, onUnhandledError]);

    return <HostedWidgetPaymentMethod
        { ...rest }
        containerId="paymentWidget"
        hideContentWhenSignedOut
        initializeCustomer={ initializeAmazonCustomer }
        initializePayment={ initializeAmazonPayment }
        isSignInRequired={ true }
        signInCustomer={ signInAmazon }
    />;
};

export default AmazonPaymentMethod;
