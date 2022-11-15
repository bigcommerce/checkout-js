import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { FunctionComponent, useCallback, useContext } from 'react';
import { Omit } from 'utility-types';

import {
    HostedFieldPaymentMethodComponent,
    HostedFieldPaymentMethodComponentProps
} from '@bigcommerce/checkout/hosted-field-integration';

import PaymentContext from '../PaymentContext';

export type SquarePaymentMethodProps = Omit<
    HostedFieldPaymentMethodComponentProps,
    'cardCodeId' | 'cardExpiryId' | 'cardNumberId' | 'postalCodeId' | 'walletButtons'
>;

const SquarePaymentMethod: FunctionComponent<SquarePaymentMethodProps> = ({
    initializePayment,
    method,
    onUnhandledError = noop,
    ...rest
}) => {
    const paymentContext = useContext(PaymentContext);
    const initializeSquarePayment = useCallback(
        (options: PaymentInitializeOptions) =>
            initializePayment({
                ...options,
                square: {
                    cardNumber: {
                        elementId: 'sq-card-number',
                    },
                    cvv: {
                        elementId: 'sq-cvv',
                    },
                    expirationDate: {
                        elementId: 'sq-expiration-date',
                    },
                    postalCode: {
                        elementId: 'sq-postal-code',
                    },
                    inputClass: 'form-input',
                    // FIXME: Need to pass the color values of the theme
                    inputStyles: [
                        {
                            color: '#333',
                            fontSize: '13px',
                            lineHeight: '20px',
                        },
                    ],
                },
            }),
        [initializePayment],
    );

    return (
        <HostedFieldPaymentMethodComponent
            {...rest}
            cardCodeId="sq-cvv"
            cardExpiryId="sq-expiration-date"
            cardNumberId="sq-card-number"
            initializePayment={initializeSquarePayment}
            method={method}
            onUnhandledError={(e) => {
                onUnhandledError(e);
                paymentContext?.disableSubmit(method, true);
            }}
            postalCodeId="sq-postal-code"
        />
    );
};

export default SquarePaymentMethod;
