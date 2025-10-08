import { createCreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/credit-card';
import { createCyberSourcePaymentStrategy, createCyberSourceV2PaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/cybersource';
import { createSagePayPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/sagepay';
import React, { type FunctionComponent, useCallback } from 'react';

import {
    withHostedCreditCardFieldset,
    type WithInjectedHostedCreditCardFieldsetProps,
} from '../hostedCreditCard';

import CreditCardPaymentMethod, { type CreditCardPaymentMethodProps } from './CreditCardPaymentMethod';

export type HostedCreditCardPaymentMethodProps = Omit<
    CreditCardPaymentMethodProps,
    | 'cardFieldset'
    | 'cardValidationSchema'
    | 'storedCardValidationSchema'
    | 'getStoredCardValidationFieldset'
>;

const HostedCreditCardPaymentMethod: FunctionComponent<
    HostedCreditCardPaymentMethodProps & WithInjectedHostedCreditCardFieldsetProps
> = ({
    getHostedFormOptions,
    getHostedStoredCardValidationFieldset,
    hostedFieldset,
    hostedStoredCardValidationSchema,
    hostedValidationSchema,
    initializePayment,
    ...rest
}) => {
    const initializeHostedCreditCardPayment: CreditCardPaymentMethodProps['initializePayment'] =
        useCallback(
            async (options, selectedInstrument) => {
                return initializePayment({
                    ...options,
                    integrations: [
                        ...options.integrations ?? [],
                        createCreditCardPaymentStrategy,
                        createCyberSourcePaymentStrategy,
                        createCyberSourceV2PaymentStrategy,
                        createSagePayPaymentStrategy,
                    ],
                    creditCard: getHostedFormOptions && {
                        form: await getHostedFormOptions(selectedInstrument),
                    },
                });
            },
            [getHostedFormOptions, initializePayment],
        );

    return (
        <CreditCardPaymentMethod
            {...rest}
            cardFieldset={hostedFieldset}
            cardValidationSchema={hostedValidationSchema}
            getStoredCardValidationFieldset={getHostedStoredCardValidationFieldset}
            initializePayment={initializeHostedCreditCardPayment}
            storedCardValidationSchema={hostedStoredCardValidationSchema}
        />
    );
};

export default withHostedCreditCardFieldset(HostedCreditCardPaymentMethod);
