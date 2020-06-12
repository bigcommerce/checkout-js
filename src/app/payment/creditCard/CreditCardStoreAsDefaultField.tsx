import React, { memo, useMemo, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { CheckboxFormField } from '../../ui/form';

export interface CreditCardStoreAsDefaultFieldProps {
    name: string;
    disabled?: boolean;
}

const CreditCardStoreAsDefaultField: FunctionComponent<CreditCardStoreAsDefaultFieldProps> = ({ name, disabled = false }) => {
    const labelContent = useMemo(() => (
        <TranslatedString id="payment.instrument_save_as_default_payment_method_label" />
    ), []);

    return <CheckboxFormField
        additionalClassName="form-field--shouldSetAsDefaultInstrument"
        disabled={ disabled }
        labelContent={ labelContent }
        name={ name }
    />;
};

export default memo(CreditCardStoreAsDefaultField);
