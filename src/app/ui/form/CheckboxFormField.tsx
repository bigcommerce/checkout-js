import { kebabCase } from 'lodash';
import React, { Fragment, FunctionComponent, ReactNode } from 'react';

import BasicFormField from './BasicFormField';
import CheckboxInput from './CheckboxInput';
import FormFieldError from './FormFieldError';

export interface CheckboxFormFieldProps {
    additionalClassName?: string;
    name: string;
    id?: string;
    labelContent: ReactNode;
    onChange?(isChecked: boolean): void;
}

const CheckboxFormField: FunctionComponent<CheckboxFormFieldProps> = ({
    additionalClassName,
    labelContent,
    onChange,
    name,
    id,
}) => (
    <BasicFormField
        additionalClassName={ additionalClassName }
        name={ name }
        onChange={ onChange }
        render={ ({ field }) =>
            <Fragment>
                { <CheckboxInput
                    { ...field }
                    checked={ !!field.value }
                    id={ id || field.name }
                    label={ labelContent }
                /> }

                <FormFieldError
                    name={ name }
                    testId={ `${kebabCase(name)}-field-error-message` }
                />
            </Fragment>
        }
    />
);

export default CheckboxFormField;
