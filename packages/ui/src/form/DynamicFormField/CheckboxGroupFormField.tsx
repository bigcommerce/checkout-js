/* istanbul ignore file */

import { FormFieldItem } from '@bigcommerce/checkout-sdk';
import { FieldArray, FieldArrayRenderProps, getIn } from 'formik';
import { difference, kebabCase, noop, pick } from 'lodash';
import React, { ChangeEvent, FunctionComponent, memo, ReactNode, useCallback } from 'react';

import { FormFieldContainer } from '../FormFieldContainer';
import { FormFieldError } from '../FormFieldError';

import DynamicFormFieldType from './DynamicFormFieldType';
import DynamicInput from './DynamicInput';
import MultiCheckboxControl from './MultiCheckboxControl';

export interface CheckboxGroupFormFieldProps {
    id: string;
    label: ReactNode;
    name: string;
    options: FormFieldItem[];
    onChange?(values: string[]): void;
}

type MultiCheckboxFormFieldProps = CheckboxGroupFormFieldProps &
    Pick<FieldArrayRenderProps, 'push' | 'remove' | 'pop' | 'form'>;

const MultiCheckboxFormField: FunctionComponent<MultiCheckboxFormFieldProps> = ({
    form: { values, errors },
    id,
    label,
    name,
    onChange = noop,
    options,
    push,
    remove,
}) => {
    const handleSelectAll = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const checkedValues: string[] = getIn(values, name) || [];

        difference(
            options.map(({ value }) => value),
            checkedValues,
        ).forEach((val) => push(val));

        onChange(getIn(values, name));
    }, [name, onChange, options, push, values]);

    const handleSelectNone = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const checkedValues: string[] = getIn(values, name) || [];

        checkedValues.forEach(() => remove(0));

        onChange(getIn(values, name));
    }, [name, onChange, remove, values]);

    const handleInputChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const checkedValues: string[] = getIn(values, name) || [];
            const { value, checked } = event.target;

            if (checked) {
                push(value);
            } else {
                remove(checkedValues.indexOf(value));
            }

            onChange(getIn(values, name));
        },
        [name, onChange, push, remove, values],
    );

    return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        <FormFieldContainer hasError={getIn(errors, name) && getIn(errors, name).length}>
            {label}

            {options.length > 1 && (
                <MultiCheckboxControl
                    onSelectedAll={handleSelectAll}
                    onSelectedNone={handleSelectNone}
                    testId={id}
                />
            )}

            <DynamicInput
                fieldType={DynamicFormFieldType.CHECKBOX}
                id={id}
                name={name}
                onChange={handleInputChange}
                options={options}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                value={getIn(values, name) || []}
            />

            <FormFieldError
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                errorId={`${id ?? name}-field-error-message`}
                name={name}
                testId={`${kebabCase(name)}-field-error-message`}
            />
        </FormFieldContainer>
    );
};

const CheckboxGroupFormField: FunctionComponent<CheckboxGroupFormFieldProps> = ({
    id,
    label,
    name,
    onChange,
    options,
}) => {
    const renderField = useCallback(
        (renderProps: FieldArrayRenderProps) => (
            <MultiCheckboxFormField
                id={id}
                label={label}
                name={name}
                onChange={onChange}
                options={options}
                {...pick(renderProps, ['form', 'pop', 'push', 'remove'])}
            />
        ),
        [id, label, name, onChange, options],
    );

    return <FieldArray name={name} render={renderField} />;
};

export default memo(CheckboxGroupFormField);
