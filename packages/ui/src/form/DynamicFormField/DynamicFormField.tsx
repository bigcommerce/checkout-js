import { type FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { includes } from 'lodash';
import React, { type FunctionComponent, memo, type ReactNode, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { Label } from '../Label';

import { DynamicFormFieldSelector } from './DynamicFormFieldSelector';
import DynamicFormFieldType from './DynamicFormFieldType';

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
    isNewPhoneValidationExperimentEnabled?: boolean;
    selectedCountry?: string;
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
    selectedCountry,
    isNewPhoneValidationExperimentEnabled = false,
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

    return (
        <div
            className={classNames(
                'dynamic-form-field',
                { 'floating-form-field': isFloatingLabelSupportedFieldType },
                extraClass,
            )}
        >
            <DynamicFormFieldSelector
                autocomplete={autocomplete}
                dynamicFormFieldType={dynamicFormFieldType}
                fieldType={fieldType}
                id={fieldInputId}
                isFloatingLabelEnabled={isFloatingLabelSupportedFieldType}
                isNewPhoneValidationExperimentEnabled={isNewPhoneValidationExperimentEnabled}
                label={labelComponent}
                max={max}
                maxLength={maxLength}
                min={min}
                name={fieldName}
                onChange={onChange}
                options={options}
                placeholder={placeholder}
                required={required}
                selectedCountry={selectedCountry}
            />
        </div>
    );
};

export default memo(DynamicFormField);
