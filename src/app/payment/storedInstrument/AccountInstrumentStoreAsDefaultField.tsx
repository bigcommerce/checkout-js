import React, { memo, useMemo, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { CheckboxFormField } from '../../ui/form';

export interface AccountInstrumentStoreAsDefaultFieldProps {
    name: string;
    disabled?: boolean;
}

const AccountInstrumentStoreAsDefaultField: FunctionComponent<AccountInstrumentStoreAsDefaultFieldProps> = ({ name, disabled = false }) => {
    const labelContent = useMemo(() => (
        <TranslatedString id="payment.account_instrument_save_as_default_payment_method_label" />
    ), []);

    return <CheckboxFormField
        additionalClassName="form-field--shouldSetAsDefaultInstrument"
        disabled={ disabled }
        labelContent={ labelContent }
        name={ name }
    />;
};

export default memo(AccountInstrumentStoreAsDefaultField);
