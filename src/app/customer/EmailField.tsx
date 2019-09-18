import { FieldProps } from 'formik';
import React, { memo, useCallback, useMemo, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { FormField, TextInput } from '../ui/form';

export interface EmailFieldProps {
    onChange?(value: string): void;
}

const EmailField: FunctionComponent<EmailFieldProps>  = ({
    onChange,
}) => {
    const renderInput = useCallback((props: FieldProps) => (
        <TextInput
            { ...props.field }
            autoComplete={ props.field.name }
            id={ props.field.name }
            type="email"
        />
    ), []);

    const labelContent = useMemo(() => (
        <TranslatedString id="customer.email_label" />
    ), []);

    return <FormField
        input={ renderInput }
        labelContent={ labelContent }
        name="email"
        onChange={ onChange }
    />;
};

export default memo(EmailField);
