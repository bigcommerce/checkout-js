import { CardInstrument, PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback } from 'react';

import {
    withHostedCreditCardFieldset,
    WithInjectedHostedCreditCardFieldsetProps,
} from '../hostedCreditCard';

import HostedWidgetPaymentMethod, {
    HostedWidgetPaymentMethodProps,
} from './HostedWidgetPaymentMethod';

export type MonerisPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

const MonerisPaymentMethod: FunctionComponent<
    MonerisPaymentMethodProps & WithInjectedHostedCreditCardFieldsetProps
> = ({
    initializePayment,
    method,
    getHostedFormOptions,
    getHostedStoredCardValidationFieldset,
    hostedStoredCardValidationSchema,
    ...rest
}) => {
    const containerId = `moneris-iframe-container`;

    const initializeMonerisPayment: HostedWidgetPaymentMethodProps['initializePayment'] =
        useCallback(
            async (options: PaymentInitializeOptions, selectedInstrument) =>
                initializePayment({
                    ...options,
                    moneris: {
                        containerId,
                        ...(selectedInstrument && {
                            form: await getHostedFormOptions(selectedInstrument),
                        }),
                    },
                }),
            [containerId, getHostedFormOptions, initializePayment],
        );

    function validateInstrument(_shouldShowNumber: boolean, selectedInstrument: CardInstrument) {
        return getHostedStoredCardValidationFieldset(selectedInstrument);
    }

    return (
        <HostedWidgetPaymentMethod
            {...rest}
            containerId={containerId}
            initializePayment={initializeMonerisPayment}
            method={method}
            storedCardValidationSchema={hostedStoredCardValidationSchema}
            validateInstrument={validateInstrument}
        />
    );
};

export default withHostedCreditCardFieldset(MonerisPaymentMethod);
