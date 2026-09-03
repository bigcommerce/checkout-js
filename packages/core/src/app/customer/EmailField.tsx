import { type FieldProps } from 'formik';
import React, { type FunctionComponent, memo, useCallback, useContext, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { FormContext, FormField, TextInput } from '@bigcommerce/checkout/ui';

export interface EmailFieldProps {
    isFloatingLabelEnabled?: boolean;
    onChange?(value: string): void;
}

const FIELD_NAME = 'email';

const EmailField: FunctionComponent<EmailFieldProps> = ({ onChange, isFloatingLabelEnabled }) => {
    const { isSubmitted } = useContext(FormContext);
    const errorId = `${FIELD_NAME}-field-error-message`;

    const renderInput = useCallback(
        ({ field, meta }: FieldProps) => (
            <TextInput
                {...field}
                aria-describedby={errorId}
                aria-invalid={Boolean(meta.error && meta.touched && isSubmitted)}
                autoComplete={field.name}
                id={field.name}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
                type="email"
            />
        ),
        [isFloatingLabelEnabled, isSubmitted],
    );

    const labelContent = useMemo(() => <TranslatedString id="customer.email_label" />, []);

    return (
        <FormField
            input={renderInput}
            isFloatingLabelEnabled={isFloatingLabelEnabled}
            labelContent={labelContent}
            name={FIELD_NAME}
            onChange={onChange}
        />
    );
};

export default memo(EmailField);
