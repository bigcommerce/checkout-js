import { FieldProps } from 'formik';
import { kebabCase } from 'lodash';
import React, { memo, useCallback, Fragment, FunctionComponent, ReactNode } from 'react';

import BasicFormField from './BasicFormField';
import FormFieldError from './FormFieldError';
import Label from './Label';

export interface FormFieldProps {
    additionalClassName?: string;
    name: string;
    label?: ReactNode | ((fieldName: string) => ReactNode);
    labelContent?: ReactNode;
    footer?: ReactNode;
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
}) => {
    const renderField = useCallback(props => (
        <Fragment>
            { label && (typeof label === 'function' ? label(name) : label) }
            { labelContent && !label && <Label htmlFor={ name }>
                { labelContent }
            </Label> }

            { input(props) }

            <FormFieldError
                name={ name }
                testId={ `${kebabCase(name)}-field-error-message` }
            />

            { footer }
        </Fragment>
    ), [
        label,
        labelContent,
        input,
        name,
        footer,
    ]);

    return <BasicFormField
        additionalClassName={ additionalClassName }
        name={ name }
        onChange={ onChange }
        render={ renderField }
    />;
};

export default memo(FormField);
