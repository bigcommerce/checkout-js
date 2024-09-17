import classNames from 'classnames';
import React, { FunctionComponent, ReactNode } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Fieldset, Legend } from '@bigcommerce/checkout/ui';

import {
    HostedCreditCardCodeField,
    HostedCreditCardExpiryField,
    HostedCreditCardNameField,
    HostedCreditCardNumberField,
} from '../';

export interface HostedCreditCardFieldsetProps {
    additionalFields?: ReactNode;
    cardCodeId?: string;
    cardExpiryId: string;
    cardNameId?: string;
    cardNumberId: string;
    focusedFieldType?: string;
}

const HostedCreditCardFieldset: FunctionComponent<HostedCreditCardFieldsetProps> = ({
    additionalFields,
    cardCodeId,
    cardExpiryId,
    cardNameId,
    cardNumberId,
    focusedFieldType,
}) => (
    <Fieldset
        legend={
            <Legend hidden>
                <TranslatedString id="payment.credit_card_text" />
            </Legend>
        }
    >
        <div
            className={classNames('form-ccFields', {
                'form-ccFields--without-card-name': !cardNameId,
                'form-ccFields--without-card-code': !cardCodeId,
            })}
        >
            <HostedCreditCardNumberField
                appearFocused={focusedFieldType === 'cardNumber'}
                id={cardNumberId}
                name="hostedForm.errors.cardNumber"
            />

            <HostedCreditCardExpiryField
                appearFocused={focusedFieldType === 'cardExpiry'}
                id={cardExpiryId}
                name="hostedForm.errors.cardExpiry"
            />

            {Boolean(cardNameId) && (
                <HostedCreditCardNameField
                    appearFocused={focusedFieldType === 'cardName'}
                    id={cardNameId}
                    name="hostedForm.errors.cardName"
                />
            )}

            {Boolean(cardCodeId) && (
                <HostedCreditCardCodeField
                    appearFocused={focusedFieldType === 'cardCode'}
                    id={cardCodeId}
                    name="hostedForm.errors.cardCode"
                />
            )}

            {additionalFields}
        </div>
    </Fieldset>
);

export default HostedCreditCardFieldset;
