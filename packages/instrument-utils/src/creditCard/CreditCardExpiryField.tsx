import { memoizeOne } from '@bigcommerce/memoize';
import { FieldProps } from 'formik';
import React, { ChangeEvent, FunctionComponent, memo, useCallback, useMemo } from 'react';

import { TranslatedString, useLocale } from '@bigcommerce/checkout/locale';
import { FormField, TextInput } from '@bigcommerce/checkout/ui';

import { formatCreditCardExpiryDate } from '.';

interface CreditCardExpiryFieldProps {
    name: string;
}

const CreditCardExpiryField: FunctionComponent<CreditCardExpiryFieldProps> = ({ name }) => {
    const { language } = useLocale();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleChange = useCallback(
        memoizeOne((field: FieldProps['field'], form: FieldProps['form']) => {
            return (event: ChangeEvent<any>) => {
                form.setFieldValue(field.name, formatCreditCardExpiryDate(event.target.value));
            };
        }),
        [],
    );

    const renderInput = useCallback(
        ({ field, form }: FieldProps) => (
            <TextInput
                {...field}
                autoComplete="cc-exp"
                id={field.name}
                onChange={handleChange(field, form)}
                placeholder={language.translate('payment.credit_card_expiration_placeholder_text')}
                type="tel"
            />
        ),
        [handleChange, language],
    );

    const labelContent = useMemo(
        () => <TranslatedString id="payment.credit_card_expiration_label" />,
        [],
    );

    return (
        <FormField
            additionalClassName="form-field--ccExpiry"
            input={renderInput}
            labelContent={labelContent}
            name={name}
        />
    );
};

export default memo(CreditCardExpiryField);
