import React, { FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type SquarePaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId' | 'hideContentWhenSignedOut'>;

const StripePaymentMethod: FunctionComponent<SquarePaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => (
    <HostedWidgetPaymentMethod
        { ...rest }
        containerId="stripe-card-field"
        hideContentWhenSignedOut
        initializePayment={ options => initializePayment({
            ...options,
            stripev3: {
                containerId: 'stripe-card-field',
                style: {
                    base: {
                        color: '#32325d',
                        fontWeight: 500,
                        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                        fontSize: '16px',
                        fontSmoothing: 'antialiased',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                    },
                    invalid: {
                        color: '#fa755a',
                        iconColor: '#fa755a',
                    },
                },
            },
        }) }
    />
);

export default StripePaymentMethod;
