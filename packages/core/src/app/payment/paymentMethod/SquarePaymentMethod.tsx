import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import HostedFieldPaymentMethod, { HostedFieldPaymentMethodProps } from './HostedFieldPaymentMethod';

export type SquarePaymentMethodProps = Omit<HostedFieldPaymentMethodProps, 'cardCodeId' | 'cardExpiryId' | 'cardNumberId' | 'postalCodeId' | 'walletButtons'>;

const SquarePaymentMethod: FunctionComponent<SquarePaymentMethodProps> = ({
    initializePayment,
    method,
    ...rest
}) => {
    const initializeSquarePayment = useCallback((options: PaymentInitializeOptions) => initializePayment({
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
    }), [initializePayment]);

    return <HostedFieldPaymentMethod
        { ...rest }
        cardCodeId="sq-cvv"
        cardExpiryId="sq-expiration-date"
        cardNumberId="sq-card-number"
        initializePayment={ initializeSquarePayment }
        method={ method }
        postalCodeId="sq-postal-code"
    />;
};

export default SquarePaymentMethod;
