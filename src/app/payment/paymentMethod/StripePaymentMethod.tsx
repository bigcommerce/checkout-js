import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { getCreditCardInputStyles, CreditCardInputStylesType } from '../creditCard';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type SquarePaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId' | 'hideContentWhenSignedOut'>;

const StripePaymentMethod: FunctionComponent<SquarePaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => {
    const initializeStripePayment = useCallback(async (options: PaymentInitializeOptions) => {
        const creditCardInputStyles =  await getCreditCardInputStyles('stripe-card-field', ['color', 'fontFamily', 'fontWeight', 'fontSmoothing']);
        const creditCardInputErrorStyles = await getCreditCardInputStyles('stripe-card-field', ['color'], CreditCardInputStylesType.Error);

        return initializePayment({
            ...options,
            stripev3: {
                containerId: 'stripe-card-field',
                style: {
                    base: {
                        ...creditCardInputStyles,
                        '::placeholder': {
                            color: '#E1E1E1',
                        },
                    },
                    invalid: {
                        ...creditCardInputErrorStyles,
                        iconColor: creditCardInputErrorStyles.color,
                    },
                },
            },
        });
    }, [initializePayment]);

    return <HostedWidgetPaymentMethod
        { ...rest }
        additionalContainerClassName="optimizedCheckout-form-input"
        containerId="stripe-card-field"
        hideContentWhenSignedOut
        initializePayment={ initializeStripePayment }
    />;
};

export default StripePaymentMethod;
