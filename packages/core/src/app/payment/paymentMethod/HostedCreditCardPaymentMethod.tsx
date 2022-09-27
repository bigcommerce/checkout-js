import React, { FunctionComponent, useCallback } from 'react';

import {
    withHostedCreditCardFieldset,
    WithInjectedHostedCreditCardFieldsetProps,
} from '../hostedCreditCard';

import CreditCardPaymentMethod, { CreditCardPaymentMethodProps } from './CreditCardPaymentMethod';

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
