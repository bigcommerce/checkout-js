import React, { FunctionComponent, useCallback } from 'react';

import { WithInjectedHostedCreditCardFieldsetProps } from '../hostedCreditCard';

import CreditCardPaymentMethod, { CreditCardPaymentMethodProps } from './CreditCardPaymentMethod';
import withHostedPayPalCommerceCreditCardFieldset from '../hostedCreditCard/withHostedPayPalCommerceCreditCardFieldset';

export type PaypalCommerceCreditCardPaymentMethodProps = CreditCardPaymentMethodProps;

const PaypalCommerceCreditCardPaymentMethod: FunctionComponent<
    PaypalCommerceCreditCardPaymentMethodProps & WithInjectedHostedCreditCardFieldsetProps
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
                    paypalcommercecreditcards: {
                        form:
                            getHostedFormOptions &&
                            (await getHostedFormOptions(selectedInstrument)),
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

export default withHostedPayPalCommerceCreditCardFieldset(PaypalCommerceCreditCardPaymentMethod);
