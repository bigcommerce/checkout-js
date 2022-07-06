import { FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import React, { memo, useCallback, useMemo, FunctionComponent, ReactNode } from 'react';

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
    onChange?(value: string | string[]): void;
}

const DynamicFormField: FunctionComponent<DynamicFormFieldProps>  = ({
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
}) => {
    const fieldInputId = inputId || name;
    const fieldName = parentFieldName ? `${parentFieldName}.${name}` : name;

    const labelComponent = useMemo(() => (
        <Label htmlFor={ fieldInputId } id={ `${fieldInputId}-label` }>
            { label || fieldLabel }
            { !required &&
                <>
                    { ' ' }
                    <small className="optimizedCheckout-contentSecondary">
                        <TranslatedString id="common.optional_text" />
                    </small>
                </> }
        </Label>
    ), [
        fieldInputId,
        fieldLabel,
        required,
        label,
    ]);

    const dynamicFormFieldType = useMemo((): DynamicFormFieldType => {
        if (fieldType === 'text') {
            if (type === 'integer') {
                return DynamicFormFieldType.number;
            }

            return secret ?
                DynamicFormFieldType.password :
                DynamicFormFieldType.text;
        }

        return fieldType as DynamicFormFieldType;
    }, [fieldType, type, secret]);

    const renderInput = useCallback(({ field }: FieldProps<string>) => (
        <DynamicInput
            { ...field }
            aria-labelledby={ `${fieldInputId}-label ${fieldInputId}-field-error-message` }
            autoComplete={ autocomplete }
            fieldType={ dynamicFormFieldType }
            id={ fieldInputId }
            max={ max }
            maxLength={ maxLength || undefined }
            min={ min }
            options={ options && options.items }
            placeholder={ placeholder || (options && options.helperLabel) }
            rows={ options && (options as any).rows }
        />
    ), [
        fieldInputId,
        max,
        maxLength,
        min,
        options,
        placeholder,
        dynamicFormFieldType,
        autocomplete,
    ]);

    return (
        <div className={ `dynamic-form-field ${extraClass}` }>
            { fieldType === DynamicFormFieldType.checkbox ?
                <CheckboxGroupFormField
                    id={ fieldInputId }
                    label={ labelComponent }
                    name={ fieldName }
                    onChange={ onChange }
                    options={ (options && options.items) || [] }
                /> :
                <FormField
                    id={ fieldInputId }
                    input={ renderInput }
                    label={ labelComponent }
                    name={ fieldName }
                    onChange={ onChange }
                /> }
        </div>
    );
};

export default memo(DynamicFormField);
