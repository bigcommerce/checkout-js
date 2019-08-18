import React, { FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { FormField, TextInput } from '../../ui/form';

import formatCreditCardExpiryDate from './formatCreditCardExpiryDate';

export interface CreditCardExpiryFieldProps {
    name: string;
}

const CreditCardExpiryField: FunctionComponent<CreditCardExpiryFieldProps> = ({ name }) => (
    <FormField
        additionalClassName="form-field--ccExpiry"
        labelContent={
            <TranslatedString id="payment.credit_card_expiration_label" />
        }
        input={ ({ field, form }) => (
            <TextInput
                { ...field }
                autoComplete="cc-exp"
                id={ field.name }
                onChange={ event => {
                    form.setFieldValue(field.name, formatCreditCardExpiryDate(event.target.value));
                } }
                placeholder="MM / YY"
                type="tel"
            />
        ) }
        name={ name }
    />
);

export default CreditCardExpiryField;
