import { FieldProps } from 'formik';
import { kebabCase } from 'lodash';
import React, { Fragment, FunctionComponent, ReactNode } from 'react';

import BasicFormField from './BasicFormField';
import FormFieldError from './FormFieldError';
import Label from './Label';

export interface FormFieldProps {
    additionalClassName?: string;
    name: string;
    labelContent?: ReactNode;
    footer?: ReactNode;
    input(field: FieldProps<string>): ReactNode;
    onChange?(value: string): void;
    label?(fieldName: string): ReactNode;
}

const FormField: FunctionComponent<FormFieldProps> = ({
    additionalClassName,
    labelContent,
    label,
    onChange,
    footer,
    input,
    name,
}) => (
    <BasicFormField
        additionalClassName={ additionalClassName }
        name={ name }
        onChange={ onChange }
        render={ props =>
            <Fragment>
                { label && label(name) }
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
        }
    />
);

export default FormField;
