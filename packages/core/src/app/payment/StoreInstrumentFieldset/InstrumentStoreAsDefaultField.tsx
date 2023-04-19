import React, { FunctionComponent, memo, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { CheckboxFormField } from '../../ui/form';

interface InstrumentStoreAsDefaultFieldProps {
    isAccountInstrument: boolean;
    disabled?: boolean;
}

const InstrumentStoreAsDefaultField: FunctionComponent<InstrumentStoreAsDefaultFieldProps> = ({
    isAccountInstrument,
    disabled = false,
}) => {
    const translationId = isAccountInstrument
        ? 'payment.account_instrument_save_as_default_payment_method_label'
        : 'payment.instrument_save_as_default_payment_method_label';

    const labelContent = useMemo(() => <TranslatedString id={translationId} />, [translationId]);

    return (
        <CheckboxFormField
            additionalClassName="form-field--setAsDefaultInstrument"
            disabled={disabled}
            labelContent={labelContent}
            name="shouldSetAsDefaultInstrument"
        />
    );
};

export default memo(InstrumentStoreAsDefaultField);
