import { FieldProps } from 'formik';
import { kebabCase } from 'lodash';
import React, { FunctionComponent, memo, ReactNode, useCallback } from 'react';

import BasicFormField from './BasicFormField';
import FormFieldError from './FormFieldError';
import Label from './Label';

export interface FormFieldProps {
    additionalClassName?: string;
    name: string;
    label?: ReactNode | ((fieldName: string) => ReactNode);
    labelContent?: ReactNode;
    footer?: ReactNode;
    id?: string;
    useFloatingLabel?: boolean;
    input(field: FieldProps<string>): ReactNode;
    onChange?(value: string): void;
}

const FormField: FunctionComponent<FormFieldProps> = ({
    additionalClassName,
    labelContent,
    label,
    onChange,
    footer,
    input,
    name,
    id,
    useFloatingLabel,
}) => {
    const renderField = useCallback(
        (props) => (
            <>
                {useFloatingLabel && input(props)}

                {label && (typeof label === 'function' ? label(name) : label)}
                {labelContent && !label && (
                    <Label
                        htmlFor={name}
                        id={`${id ?? name}-label`}
                        useFloatingLabel={useFloatingLabel}
                    >
                        {labelContent}
                    </Label>
                )}

                {!useFloatingLabel && input(props)}

                <FormFieldError
                    errorId={`${id ?? name}-field-error-message`}
                    name={name}
                    testId={`${kebabCase(name)}-field-error-message`}
                />

                {footer}
            </>
        ),
        [label, labelContent, id, input, name, footer, useFloatingLabel],
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

export default memo(FormField);
