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
    isFloatingLabelEnabled?: boolean;
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
    isFloatingLabelEnabled,
}) => {
    const renderField = useCallback(
        (props) => (
            <>
                {isFloatingLabelEnabled && input(props)}

                {label && (typeof label === 'function' ? label(name) : label)}
                {labelContent && !label && (
                    <Label
                        htmlFor={name}
                        id={`${id ?? name}-label`}
                        isFloatingLabelEnabled={isFloatingLabelEnabled}
                    >
                        {labelContent}
                    </Label>
                )}

                {!isFloatingLabelEnabled && input(props)}

                <FormFieldError
                    errorId={`${id ?? name}-field-error-message`}
                    name={name}
                    testId={`${kebabCase(name)}-field-error-message`}
                />

                {footer}
            </>
        ),
        [label, labelContent, id, input, name, footer, isFloatingLabelEnabled],
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
