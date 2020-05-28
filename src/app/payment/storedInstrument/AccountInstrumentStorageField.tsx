import React, { memo, useMemo, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { CheckboxFormField } from '../../ui/form';

export interface AccountInstrumentStorageFieldProps {
    name: string;
}

const AccountInstrumentStorageField: FunctionComponent<AccountInstrumentStorageFieldProps> = ({ name }) => {
    const labelContent = useMemo(() => (
        <TranslatedString id="payment.account_instrument_save_payment_method_label" />
    ), []);

    return <CheckboxFormField
        additionalClassName="form-field--saveInstrument"
        labelContent={ labelContent }
        name={ name }
    />;
};

export default memo(AccountInstrumentStorageField);
