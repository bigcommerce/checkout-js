import React, { FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import HostedFieldPaymentMethod, { HostedFieldPaymentMethodProps } from './HostedFieldPaymentMethod';

export type SquarePaymentMethodProps = Omit<HostedFieldPaymentMethodProps, 'cardCodeId' | 'cardExpiryId' | 'cardNumberId' | 'postalCodeId' | 'walletButtons'>;

const SquarePaymentMethod: FunctionComponent<SquarePaymentMethodProps> = ({
    initializePayment,
    method,
    ...rest
}) => {
    const isMasterpassEnabled = method.initializationData && method.initializationData.enableMasterpass;

    return <HostedFieldPaymentMethod
        { ...rest }
        cardCodeId="sq-cvv"
        cardExpiryId="sq-expiration-date"
        cardNumberId="sq-card-number"
        method={ method }
        initializePayment={ options => initializePayment({
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
                masterpass: isMasterpassEnabled && {
                    elementId: 'sq-masterpass',
                },
            },
        }) }
        postalCodeId="sq-postal-code"
        walletButtons={
            isMasterpassEnabled && <input
                type="button"
                id="sq-masterpass"
                className="button-masterpass"
            />
        }
    />;
};

export default SquarePaymentMethod;
