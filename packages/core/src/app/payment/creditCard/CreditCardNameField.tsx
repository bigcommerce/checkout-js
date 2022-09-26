import React, { FunctionComponent, memo, useCallback, useMemo } from 'react';

import { TranslatedString } from '../../locale';
import { FormField, TextInput } from '../../ui/form';

export interface CreditCardNameFieldProps {
    name: string;
}

const CreditCardNameField: FunctionComponent<CreditCardNameFieldProps> = ({ name }) => {
    const renderInput = useCallback(
        ({ field }) => <TextInput {...field} autoComplete="cc-name" id={field.name} />,
        [],
    );

    const labelContent = useMemo(
        () => <TranslatedString id="payment.credit_card_name_label" />,
        [],
    );

    return (
        <FormField
            additionalClassName="form-field--ccName"
            input={renderInput}
            labelContent={labelContent}
            name={name}
        />
    );
};

export default memo(CreditCardNameField);
