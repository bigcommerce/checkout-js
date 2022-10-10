import { FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { FieldProps } from 'formik';
import { includes } from 'lodash';
import React, { FunctionComponent, memo, ReactNode, useCallback, useMemo } from 'react';

import { TranslatedString } from '../../locale';

import CheckboxGroupFormField from './CheckboxGroupFormField';
import DynamicFormFieldType from './DynamicFormFieldType';
import DynamicInput from './DynamicInput';
import FormField from './FormField';
import Label from './Label';

export interface DynamicFormFieldOption {
    code: string;
    name: string;
}

export interface DynamicFormFieldProps {
    field: FormFieldType;
    inputId?: string;
    extraClass?: string;
    autocomplete?: string;
    parentFieldName?: string;
    placeholder?: string;
    label?: ReactNode;
    useFloatingLabel?: boolean;
    onChange?(value: string | string[]): void;
}

const DynamicFormField: FunctionComponent<DynamicFormFieldProps> = ({
    field: {
        fieldType,
        type,
        secret,
        name,
        label: fieldLabel,
        required,
        options,
        max,
        min,
        maxLength,
    },
    parentFieldName,
    onChange,
    placeholder,
    inputId,
    autocomplete,
    label,
    extraClass,
    useFloatingLabel,
}) => {
    const fieldInputId = inputId || name;
    const fieldName = parentFieldName ? `${parentFieldName}.${name}` : name;
    const isFloatingLabelSupportedFieldType = Boolean(
        useFloatingLabel &&
            (includes(['text', 'password', 'dropdown', 'date', 'multiline'], fieldType) ||
                !fieldType),
    );
    const labelComponent = useMemo(
        () => (
            <Label
                htmlFor={fieldInputId}
                id={`${fieldInputId}-label`}
                useFloatingLabel={isFloatingLabelSupportedFieldType}
            >
                {label || fieldLabel}
                {!required && (
                    <>
                        {' '}
                        <small className="optimizedCheckout-contentSecondary">
                            <TranslatedString id="common.optional_text" />
                        </small>
                    </>
                )}
            </Label>
        ),
        [fieldInputId, fieldLabel, required, isFloatingLabelSupportedFieldType, label],
    );

    const dynamicFormFieldType = useMemo((): DynamicFormFieldType => {
        if (fieldType === 'text') {
            if (type === 'integer') {
                return DynamicFormFieldType.number;
            }

            if (includes(name, 'phone') || includes(name, 'tel')) {
                return DynamicFormFieldType.telephone;
            }

            return secret ? DynamicFormFieldType.password : DynamicFormFieldType.text;
        }

        return fieldType as DynamicFormFieldType;
    }, [fieldType, type, secret, name]);

    const renderInput = useCallback(
        ({ field }: FieldProps<string>) => (
            <DynamicInput
                {...field}
                aria-labelledby={`${fieldInputId}-label ${fieldInputId}-field-error-message`}
                autoComplete={autocomplete}
                fieldType={dynamicFormFieldType}
                id={fieldInputId}
                max={max}
                maxLength={maxLength || undefined}
                min={min}
                options={options && options.items}
                placeholder={placeholder || (options && options.helperLabel)}
                rows={options && (options as any).rows}
                useFloatingLabel={isFloatingLabelSupportedFieldType}
            />
        ),
        [
            fieldInputId,
            max,
            maxLength,
            min,
            options,
            placeholder,
            dynamicFormFieldType,
            autocomplete,
        ],
    );

    return (
        <div
            className={classNames(
                'dynamic-form-field',
                { 'floating-form-field': isFloatingLabelSupportedFieldType },
                extraClass,
            )}
        >
            {fieldType === DynamicFormFieldType.checkbox ? (
                <CheckboxGroupFormField
                    id={fieldInputId}
                    label={labelComponent}
                    name={fieldName}
                    onChange={onChange}
                    options={(options && options.items) || []}
                />
            ) : (
                <FormField
                    id={fieldInputId}
                    input={renderInput}
                    label={labelComponent}
                    name={fieldName}
                    onChange={onChange}
                    useFloatingLabel={isFloatingLabelSupportedFieldType}
                />
            )}
        </div>
    );
};

export default memo(DynamicFormField);
