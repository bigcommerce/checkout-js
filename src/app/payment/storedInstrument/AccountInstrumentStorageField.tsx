import React, { memo, useMemo, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { CheckboxFormField } from '../../ui/form';

export interface AccountInstrumentStorageFieldProps {
    name: string;
    onChange?(isChecked: boolean): void;
}

const AccountInstrumentStorageField: FunctionComponent<AccountInstrumentStorageFieldProps> = ({ name, onChange }) => {
    const labelContent = useMemo(() => (
        <TranslatedString id="payment.account_instrument_save_payment_method_label" />
    ), []);

    return <CheckboxFormField
        additionalClassName="form-field--saveInstrument"
        labelContent={ labelContent }
        name={ name }
        onChange={ onChange }
    />;
};

export default memo(AccountInstrumentStorageField);
