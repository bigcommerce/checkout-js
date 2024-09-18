import React, { FunctionComponent, memo, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { CheckboxFormField } from '../../ui/form';

interface InstrumentStorageFieldProps {
    isAccountInstrument: boolean;
}

const InstrumentStorageField: FunctionComponent<InstrumentStorageFieldProps> = ({
    isAccountInstrument,
}) => {
    const translationId = isAccountInstrument
        ? 'payment.account_instrument_save_payment_method_label'
        : 'payment.instrument_save_payment_method_label';

    const labelContent = useMemo(() => <TranslatedString id={translationId} />, [translationId]);

    return (
        <CheckboxFormField
            additionalClassName="form-field--saveInstrument"
            labelContent={labelContent}
            name="shouldSaveInstrument"
        />
    );
};

export default memo(InstrumentStorageField);
