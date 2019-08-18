import React, { FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { CheckboxFormField } from '../../ui/form';

export interface CreditCardStorageFieldProps {
    name: string;
}

const CreditCardStorageField: FunctionComponent<CreditCardStorageFieldProps> = ({ name }) => (
    <CheckboxFormField
        additionalClassName="form-field--saveInstrument"
        name={ name }
        labelContent={ <TranslatedString id="payment.instrument_save_payment_method_label" /> }
    />
);

export default CreditCardStorageField;
