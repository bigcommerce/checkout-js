import { PaymentInitializeOptions, StripeElementOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type StripePaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

export interface StripeOptions {
    card: StripeElementOptions;
    iban: StripeElementOptions;
    idealBank: StripeElementOptions;
}

export enum StripeV3PaymentMethodType {
    card = 'card',
    iban = 'iban',
    idealBank = 'idealBank',
}

const StripePaymentMethod: FunctionComponent<StripePaymentMethodProps> = ({
    initializePayment,
    method,
    ...rest
}) => {
    const paymentMethodType = method.id as StripeV3PaymentMethodType;
    const containerId = `stripe-${paymentMethodType}-component-field`;

    const initializeStripePayment = useCallback(async (options: PaymentInitializeOptions) => {
        const classes = {
            base: 'form-input optimizedCheckout-form-input',
        };

        const stripeOptions: StripeOptions = {
            [StripeV3PaymentMethodType.card]: {
                classes,
            },
            [StripeV3PaymentMethodType.iban]: {
                ...{ classes },
                supportedCountries: ['SEPA'],
            },
            [StripeV3PaymentMethodType.idealBank]: {
                classes,
            },
        };

        return initializePayment({
            ...options,
            stripev3: {
                containerId,
                options: stripeOptions[paymentMethodType],
            },
        });
    }, [initializePayment, containerId, paymentMethodType]);

    return <HostedWidgetPaymentMethod
        { ...rest }
        additionalContainerClassName="optimizedCheckout-form-input widget--stripev3"
        containerId={ containerId }
        hideContentWhenSignedOut
        initializePayment={ initializeStripePayment }
        method={ method }
    />;
};

export default StripePaymentMethod;
