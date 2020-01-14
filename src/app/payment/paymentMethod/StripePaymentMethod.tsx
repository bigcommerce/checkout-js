import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { getCreditCardInputStyles } from '../creditCard';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type SquarePaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId' | 'hideContentWhenSignedOut'>;

const StripePaymentMethod: FunctionComponent<SquarePaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => {
    async function configureStyle() {
        const style: any = await getCreditCardInputStyles('stripe-card-field', ['color', 'fontFamily', 'fontWeight', 'fontSmoothing']);
        style["'::placeholder'"] = {color: '#E1E1E1'};

        return style;
    }

    const initializeStripePayment = useCallback(async (options: PaymentInitializeOptions) => initializePayment({
        ...options,
        stripev3: {
            containerId: 'stripe-card-field',
            style: {
                base: await configureStyle(),
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a',
                },
            },
        },
    }), [initializePayment]);

    return <HostedWidgetPaymentMethod
        { ...rest }
        containerId="stripe-card-field"
        hideContentWhenSignedOut
        initializePayment={ initializeStripePayment }
    />;
};

export default StripePaymentMethod;
