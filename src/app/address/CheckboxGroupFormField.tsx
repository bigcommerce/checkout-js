import { FormFieldItem } from '@bigcommerce/checkout-sdk';
import { getIn, FieldArray } from 'formik';
import { difference, kebabCase, noop } from 'lodash';
import React, { FunctionComponent, ReactNode } from 'react';

import { FormFieldContainer, FormFieldError } from '../ui/form';

import DynamicFormFieldType from './DynamicFormFieldType';
import DynamicInput from './DynamicInput';
import MultiCheckboxControl from './MultiCheckboxControl';

export interface CheckboxGroupFormFieldProps {
    name: string;
    id: string;
    label: ReactNode;
    options: FormFieldItem[];
    onChange?(values: string[]): void;
}

const CheckboxGroupFormField: FunctionComponent<CheckboxGroupFormFieldProps> = ({
    label,
    name,
    id,
    options,
    onChange = noop,
}) => (
    <FieldArray
        name={ name }
        render={ ({ push, remove, pop, form: { values, errors } }) => (
            <FormFieldContainer hasError={ getIn(errors, name) && getIn(errors, name).length }>
                { label }
                <MultiCheckboxControl
                    testId={ id }
                    onSelectedAll={ () => {
                        const checkedValues: string[] = getIn(values, name) || [];
                        difference(options.map(({ value }) => value), checkedValues)
                            .forEach(val => push(val));

                        onChange(getIn(values, name));
                    }}
                    onSelectedNone={ () => {
                        const checkedValues: string[] = getIn(values, name) || [];
                        checkedValues.forEach(() => pop());
                        onChange(getIn(values, name));
                    }}
                />
                <DynamicInput
                    name={ name }
                    value={ getIn(values, name) || [] }
                    onChange={e => {
                        const checkedValues: string[] = getIn(values, name) || [];
                        const { value, checked } = e.target;

                        if (checked) {
                            push(value);
                        } else {
                            remove(checkedValues.indexOf(value));
                        }

                        onChange(getIn(values, name));
                    } }
                    fieldType={ DynamicFormFieldType.checkbox }
                    options={ options }
                    id={ id }
                />
                <FormFieldError
                    name={ name }
                    testId={ `${kebabCase(name)}-field-error-message` }
                />
            </FormFieldContainer>
        )}
    />
);

export default CheckboxGroupFormField;
