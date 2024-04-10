import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

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
    const [isInitializing, toggleIsInitializing] = useState(() => rest.isInitializing);

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

    // We should have this delay, because there is a strange pre-loaders from PayPal sdk when we initialize a strategy.
    // We can't remove it using PayPal api, so for now we hide it with a little loader delay.
        useEffect(() => {
            const delay = setTimeout(() => {
                if (!rest.isInitializing) {
                    toggleIsInitializing(false);
                }
            }, 1900);

            if (rest.isInitializing) {
                clearTimeout(delay);
                toggleIsInitializing(rest.isInitializing);
            }

            return () => clearTimeout(delay);
        }, [rest.isInitializing]);


    return (
        <CreditCardPaymentMethod
            {...rest}
            isInitializing={isInitializing}
            cardFieldset={hostedFieldset}
            cardValidationSchema={hostedValidationSchema}
            getStoredCardValidationFieldset={getHostedStoredCardValidationFieldset}
            initializePayment={initializeHostedCreditCardPayment}
            storedCardValidationSchema={hostedStoredCardValidationSchema}
        />
    );
};

export default withHostedPayPalCommerceCreditCardFieldset(PaypalCommerceCreditCardPaymentMethod);
