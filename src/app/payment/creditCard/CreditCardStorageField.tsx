import React, { useMemo, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { CheckboxFormField } from '../../ui/form';

export interface CreditCardStorageFieldProps {
    name: string;
}

const CreditCardStorageField: FunctionComponent<CreditCardStorageFieldProps> = ({ name }) => {
    const labelContent = useMemo(() => (
        <TranslatedString id="payment.instrument_save_payment_method_label" />
    ), []);

    return <CheckboxFormField
        additionalClassName="form-field--saveInstrument"
        name={ name }
        labelContent={ labelContent }
    />;
};

export default CreditCardStorageField;
