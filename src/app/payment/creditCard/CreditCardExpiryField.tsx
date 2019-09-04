import { memoizeOne } from '@bigcommerce/memoize';
import { FieldProps } from 'formik';
import React, { memo, useCallback, useMemo, ChangeEvent, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { FormField, TextInput } from '../../ui/form';

import formatCreditCardExpiryDate from './formatCreditCardExpiryDate';

export interface CreditCardExpiryFieldProps {
    name: string;
}

const CreditCardExpiryField: FunctionComponent<CreditCardExpiryFieldProps> = ({ name }) => {
    const handleChange = useCallback(memoizeOne((field: FieldProps['field'], form: FieldProps['form']) => {
        return (event: ChangeEvent<any>) => {
            form.setFieldValue(field.name, formatCreditCardExpiryDate(event.target.value));
        };
    }), []);

    const renderInput = useCallback(({ field, form }: FieldProps) => (
        <TextInput
            { ...field }
            autoComplete="cc-exp"
            id={ field.name }
            onChange={ handleChange(field, form) }
            placeholder="MM / YY"
            type="tel"
        />
    ), [handleChange]);

    const labelContent = useMemo(() => (
        <TranslatedString id="payment.credit_card_expiration_label" />
    ), []);

    return <FormField
        additionalClassName="form-field--ccExpiry"
        labelContent={ labelContent }
        input={ renderInput }
        name={ name }
    />;
};

export default memo(CreditCardExpiryField);
