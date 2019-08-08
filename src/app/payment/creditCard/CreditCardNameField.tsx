import React, { FunctionComponent } from 'react';

import { TranslatedString } from '../../language';
import { FormField, TextInput } from '../../ui/form';

export interface CreditCardNameFieldProps {
    name: string;
}

const CreditCardNameField: FunctionComponent<CreditCardNameFieldProps> = ({ name }) => (
    <FormField
        additionalClassName="form-field--ccName"
        labelContent={
            <TranslatedString id="payment.credit_card_name_label" />
        }
        input={ ({ field }) => (
            <TextInput
                { ...field }
                autoComplete="cc-name"
                id={ field.name }
            />
        ) }
        name={ name }
    />
);

export default CreditCardNameField;
