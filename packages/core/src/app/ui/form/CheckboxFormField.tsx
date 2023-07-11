import { FieldProps } from 'formik';
import { kebabCase } from 'lodash';
import React, { FunctionComponent, memo, ReactNode, useCallback } from 'react';

import BasicFormField from './BasicFormField';
import CheckboxInput from './CheckboxInput';
import FormFieldError from './FormFieldError';

export interface CheckboxFormFieldProps {
    additionalClassName?: string;
    disabled?: boolean;
    name: string;
    id?: string;
    labelContent: ReactNode;
    onChange?(isChecked: boolean): void;
    testId?: string;
}

const CheckboxFormField: FunctionComponent<CheckboxFormFieldProps> = ({
    additionalClassName,
    disabled = false,
    labelContent,
    onChange,
    name,
    id,
    testId,
}) => {
    const renderField = useCallback(
        ({ field }: FieldProps) => (
            <>
                <CheckboxInput
                    {...field}
                    checked={!!field.value}
                    disabled={disabled}
                    id={id || field.name}
                    label={labelContent}
                    testId={testId}
                />

                <FormFieldError
                    errorId={`${id ?? name}-field-error-message`}
                    name={name}
                    testId={`${kebabCase(name)}-field-error-message`}
                />
            </>
        ),
        [disabled, id, labelContent, name],
    );

    return (
        <BasicFormField
            additionalClassName={additionalClassName}
            name={name}
            onChange={onChange}
            render={renderField}
        />
    );
};

export default memo(CheckboxFormField);
