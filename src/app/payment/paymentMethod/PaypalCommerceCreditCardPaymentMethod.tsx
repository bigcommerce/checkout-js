import React, { useCallback, FunctionComponent } from 'react';

import { withHostedCreditCardFieldset, WithInjectedHostedCreditCardFieldsetProps } from '../hostedCreditCard';

import CreditCardPaymentMethod, { CreditCardPaymentMethodProps } from './CreditCardPaymentMethod';

export type PaypalCommerceCreditCardPaymentMethodProps = CreditCardPaymentMethodProps;

const PaypalCommerceCreditCardPaymentMethod: FunctionComponent<
    PaypalCommerceCreditCardPaymentMethodProps &
    WithInjectedHostedCreditCardFieldsetProps
> = ({
    getHostedFormOptions,
    getHostedStoredCardValidationFieldset,
    hostedFieldset,
    hostedStoredCardValidationSchema,
    hostedValidationSchema,
    initializePayment,
    ...rest
}) => {
    const initializeHostedCreditCardPayment: CreditCardPaymentMethodProps['initializePayment'] = useCallback(async (options, selectedInstrument) => {
        return initializePayment({
            ...options,
            paypalcommerce: {
                form: getHostedFormOptions && await getHostedFormOptions(selectedInstrument),
            },
        });
    }, [
        getHostedFormOptions,
        initializePayment,
    ]);

    return <CreditCardPaymentMethod
        { ...rest }
        cardFieldset={ hostedFieldset }
        cardValidationSchema={ hostedValidationSchema }
        getStoredCardValidationFieldset={ getHostedStoredCardValidationFieldset }
        initializePayment={ initializeHostedCreditCardPayment }
        storedCardValidationSchema={ hostedStoredCardValidationSchema }
    />;
};

export default withHostedCreditCardFieldset(PaypalCommerceCreditCardPaymentMethod);
