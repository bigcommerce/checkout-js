import { FieldProps } from 'formik';
import React, { useCallback, FunctionComponent } from 'react';

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

    return <FormField
        name="email"
        labelContent={ <TranslatedString id="customer.email_label" /> }
        onChange={ onChange }
        input={ renderInput }
    />;
};

export default EmailField;
