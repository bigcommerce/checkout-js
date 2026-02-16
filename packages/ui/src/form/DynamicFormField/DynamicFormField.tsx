import { type FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { type FieldProps } from 'formik';
import { includes } from 'lodash';
import React, { type FunctionComponent, memo, type ReactNode, useCallback, useMemo } from 'react';

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
    isFloatingLabelEnabled?: boolean;
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
    isFloatingLabelEnabled,
}) => {
    const fieldInputId = inputId || name;
    const fieldName = parentFieldName ? `${parentFieldName}.${name}` : name;
    const isFloatingLabelSupportedFieldType = Boolean(
        isFloatingLabelEnabled &&
            (includes(['text', 'password', 'dropdown', 'date', 'multiline'], fieldType) ||
                !fieldType),
    );
    const labelComponent = useMemo(() => {
        let labelClassName = 'body-medium';

        if (isFloatingLabelSupportedFieldType) {
            labelClassName = 'floating-form-field-label';
        }

        return (
            <Label
                additionalClassName={labelClassName}
                htmlFor={fieldInputId}
                id={`${fieldInputId}-label`}
                isFloatingLabelEnabled={isFloatingLabelSupportedFieldType}
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
        );
    }, [fieldInputId, isFloatingLabelSupportedFieldType, label, fieldLabel, required]);

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
    }, [fieldType, type, secret, name]);

    const renderInput = useCallback(
        ({ field }: FieldProps<string>) => (
            <DynamicInput
                {...field}
                aria-labelledby={`${fieldInputId}-label ${fieldInputId}-field-error-message`}
                autoComplete={autocomplete}
                fieldType={dynamicFormFieldType}
                id={fieldInputId}
                isFloatingLabelEnabled={isFloatingLabelSupportedFieldType}
                max={max}
                maxLength={maxLength || undefined}
                min={min}
                options={options && options.items}
                placeholder={placeholder || (options && options.helperLabel)}
                rows={options?.rows}
            />
        ),
        [
            fieldInputId,
            autocomplete,
            dynamicFormFieldType,
            isFloatingLabelSupportedFieldType,
            max,
            maxLength,
            min,
            options,
            placeholder,
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
                    isFloatingLabelEnabled={isFloatingLabelSupportedFieldType}
                    label={labelComponent}
                    name={fieldName}
                    onChange={onChange}
                />
            )}
        </div>
    );
};

export default memo(DynamicFormField);
