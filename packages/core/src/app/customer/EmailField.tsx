import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback, useMemo } from 'react';

import { TranslatedString } from '../locale';
import { FormField, TextInput } from '../ui/form';

export interface EmailFieldProps {
    useFloatingLabel?: boolean;
    onChange?(value: string): void;
}

const EmailField: FunctionComponent<EmailFieldProps> = ({ onChange, useFloatingLabel }) => {
    const renderInput = useCallback(
        (props: FieldProps) => (
            <TextInput
                {...props.field}
                autoComplete={props.field.name}
                id={props.field.name}
                type="email"
                useFloatingLabel={useFloatingLabel}
            />
        ),
        [useFloatingLabel],
    );

    const labelContent = useMemo(() => <TranslatedString id="customer.email_label" />, []);

    return (
        <FormField
            input={renderInput}
            labelContent={labelContent}
            name="email"
            onChange={onChange}
            useFloatingLabel={useFloatingLabel}
        />
    );
};

export default memo(EmailField);
