import { type FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import { type FieldProps } from 'formik';
import React, { type FunctionComponent, memo, type ReactNode, useCallback } from 'react';

import { FormField } from '../FormField';
import { PhoneFormField } from '../PhoneFormField/PhoneFormField';

import CheckboxGroupFormField from './CheckboxGroupFormField';
import DynamicFormFieldType from './DynamicFormFieldType';
import DynamicInput from './DynamicInput';

interface DynamicFormFieldSelectorProps {
    fieldType?: FormFieldType['fieldType'];
    dynamicFormFieldType: DynamicFormFieldType;
    id: string;
    name: string;
    label: ReactNode;
    options?: FormFieldType['options'];
    autocomplete?: string;
    placeholder?: string;
    max?: FormFieldType['max'];
    min?: FormFieldType['min'];
    maxLength?: FormFieldType['maxLength'];
    isFloatingLabelEnabled?: boolean;
    isNewPhoneValidationExperimentEnabled: boolean;
    selectedCountry?: string;
    onChange?(value: string | string[]): void;
}

export const DynamicFormFieldSelector: FunctionComponent<DynamicFormFieldSelectorProps> = memo(
    ({
        fieldType,
        dynamicFormFieldType,
        id,
        name,
        label,
        options,
        autocomplete,
        placeholder,
        max,
        min,
        maxLength,
        isFloatingLabelEnabled,
        isNewPhoneValidationExperimentEnabled,
        selectedCountry,
        onChange,
    }) => {
        const isNewPhoneFieldWithValidation =
            isNewPhoneValidationExperimentEnabled &&
            dynamicFormFieldType === DynamicFormFieldType.TELEPHONE;

        const renderInput = useCallback(
            ({ field }: FieldProps<string>) => (
                <DynamicInput
                    {...field}
                    aria-labelledby={`${id}-label ${id}-field-error-message`}
                    autoComplete={autocomplete}
                    fieldType={dynamicFormFieldType}
                    id={id}
                    isFloatingLabelEnabled={isFloatingLabelEnabled}
                    max={max}
                    maxLength={maxLength || undefined}
                    min={min}
                    options={options && options.items}
                    placeholder={placeholder || (options && options.helperLabel)}
                    rows={options?.rows}
                />
            ),
            [
                id,
                autocomplete,
                dynamicFormFieldType,
                isFloatingLabelEnabled,
                max,
                maxLength,
                min,
                options,
                placeholder,
            ],
        );

        if (fieldType === DynamicFormFieldType.CHECKBOX) {
            return (
                <CheckboxGroupFormField
                    id={id}
                    label={label}
                    name={name}
                    onChange={onChange}
                    options={(options && options.items) || []}
                />
            );
        }

        if (isNewPhoneFieldWithValidation) {
            return (
                <PhoneFormField
                    autocomplete={autocomplete}
                    id={id}
                    isFloatingLabelEnabled={isFloatingLabelEnabled}
                    label={label}
                    maxLength={maxLength || undefined}
                    name={name}
                    onChange={onChange}
                    selectedCountry={selectedCountry}
                />
            );
        }

        return (
            <FormField
                id={id}
                input={renderInput}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
                label={label}
                name={name}
                onChange={onChange}
            />
        );
    },
);
