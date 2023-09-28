import React, { FunctionComponent } from 'react';
import { TranslatedString } from '@bigcommerce/checkout/locale';

export interface MandateTextComponentProps {
    mandateText: {
        [key: string]: string;
    },
    methodId: string;
    providerId: string;
}

export const MandateTextComponent: FunctionComponent<MandateTextComponentProps> = ({
    mandateText,
    providerId,
    methodId,
}) => {
    if (!Object.keys(mandateText).length) {
        return null;
    }

    return (
        <ul data-test='order-confirmation-mandate-text-list'>
            {Object.entries(mandateText).map((field, index) => {
                return (
                    <li key={index} data-test={`order-confirmation-mandate-text-list-item-${index}`}>
                        <TranslatedString
                            id={`order_confirmation.mandate.${providerId}.${methodId}.${field[0]}`}
                        />:
                        <b>
                            {` ${field[1]}`}
                        </b>
                    </li>
                )
            })}
        </ul>
    )
}
