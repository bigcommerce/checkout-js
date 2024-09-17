import { FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import { includes } from 'lodash';
import React, { FunctionComponent, memo, ReactNode, useCallback, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { FormField } from '../FormField';
import { Label } from '../Label';

import CheckboxGroupFormField from './CheckboxGroupFormField';
import DynamicFormFieldType from './DynamicFormFieldType';
import DynamicInput from './DynamicInput';

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
        inputDateFormat,
    },
    parentFieldName,
    onChange,
    placeholder,
    inputId,
    autocomplete,
    label,
    extraClass,
}) => {
    const fieldInputId = inputId || name;
    const fieldName = parentFieldName ? `${parentFieldName}.${name}` : name;

    const labelComponent = useMemo(
        () => (
            <Label htmlFor={fieldInputId} id={`${fieldInputId}-label`}>
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
        [fieldInputId, fieldLabel, required, label],
    );

    const dynamicFormFieldType = useMemo((): DynamicFormFieldType => {
        if (fieldType === 'text') {
            if (type === 'integer') {
                return DynamicFormFieldType.NUMBER;
            }

            if (includes(name, 'phone') || includes(name, 'tel')) {
                return DynamicFormFieldType.TELEPHONE;
            }

            return secret ? DynamicFormFieldType.PASSWORD : DynamicFormFieldType.TEXT;
        }

        return fieldType as DynamicFormFieldType;
    }, [fieldType, type, name, secret]);

    const renderInput = useCallback(
        ({ field }: FieldProps<string>) => (
            <DynamicInput
                {...field}
                aria-labelledby={`${fieldInputId}-label ${fieldInputId}-field-error-message`}
                autoComplete={autocomplete}
                fieldType={dynamicFormFieldType}
                id={fieldInputId}
                inputDateFormat={inputDateFormat}
                max={max}
                maxLength={maxLength || undefined}
                min={min}
                options={options && options.items}
                placeholder={placeholder || (options && options.helperLabel)}
                rows={options && options.rows}
            />
        ),
        [
            inputDateFormat,
            fieldInputId,
            autocomplete,
            dynamicFormFieldType,
            max,
            maxLength,
            min,
            options,
            placeholder,
        ],
    );

    return (
        <div className={`dynamic-form-field ${extraClass || ''}`}>
            {fieldType === DynamicFormFieldType.CHECKBOX ? (
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
                />
            )}
        </div>
    );
};

export default memo(DynamicFormField);
