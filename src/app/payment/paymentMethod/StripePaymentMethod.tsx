import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { getCreditCardInputStyles, CreditCardInputStylesType } from '../creditCard';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type StripePaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

const StripePaymentMethod: FunctionComponent<StripePaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => {
    // method.gateway = 'stripev3';
    // method.id = 'card' | 'idealBank' | 'iban';
    const type = 'card' || rest.method.id;
    const containerId = `stripe-${type}-element`;

    const initializeStripePayment = useCallback(async (options: PaymentInitializeOptions) => {
        const properties = ['color', 'fontFamily', 'fontSize', 'fontWeight'];
        const creditCardInputStyles =  await getCreditCardInputStyles(containerId, properties);
        const creditCardInputErrorStyles = await getCreditCardInputStyles(containerId, properties, CreditCardInputStylesType.Error);

        return initializePayment({
            ...options,
            stripev3: {
                type,
                containerId,
                style: {
                    base: {
                        ...creditCardInputStyles,
                        '::placeholder': {
                            color: '#E1E1E1',
                        },
                        padding: '5px',
                    },
                    invalid: {
                        ...creditCardInputErrorStyles,
                        iconColor: creditCardInputErrorStyles.color,
                    },
                },
            },
        });
    }, [containerId, initializePayment, type]);

    return <HostedWidgetPaymentMethod
        { ...rest }
        additionalContainerClassName="optimizedCheckout-form-input"
        containerId={ containerId }
        hideContentWhenSignedOut
        initializePayment={ initializeStripePayment }
    />;
};

export default StripePaymentMethod;
