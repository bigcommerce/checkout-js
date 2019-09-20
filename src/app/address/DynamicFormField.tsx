import { FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import React, { memo, useCallback, useMemo, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { FormField, Label } from '../ui/form';

import { getFormFieldInputId, getFormFieldLegacyName } from './getFormFieldInputId';
import CheckboxGroupFormField from './CheckboxGroupFormField';
import DynamicFormFieldType from './DynamicFormFieldType';
import DynamicInput from './DynamicInput';

export interface AddressKeyMap<T = string> {
    [fieldName: string]: T;
}

const LABEL: AddressKeyMap = {
    address1: 'address.address_line_1_label',
    address2: 'address.address_line_2_label',
    city: 'address.city_label',
    company: 'address.company_name_label',
    countryCode: 'address.country_label',
    firstName: 'address.first_name_label',
    lastName: 'address.last_name_label',
    phone: 'address.phone_number_label',
    postalCode: 'address.postal_code_label',
    stateOrProvince: 'address.state_label',
    stateOrProvinceCode: 'address.state_label',
};

const AUTOCOMPLETE: AddressKeyMap = {
    address1: 'address-line1',
    address2: 'address-line2',
    city: 'address-level2',
    company: 'organization',
    countryCode: 'country',
    firstName: 'given-name',
    lastName: 'family-name',
    phone: 'tel',
    postalCode: 'postal-code',
    stateOrProvince: 'address-level1',
    stateOrProvinceCode: 'address-level1',
};

export interface DynamicFormFieldOption {
    code: string;
    name: string;
}

export interface DynamicFormFieldProps {
    field: FormFieldType;
    parentFieldName?: string;
    placeholder?: string;
    fieldType?: DynamicFormFieldType;
    onChange?(value: string | string[]): void;
}

const DynamicFormField: FunctionComponent<DynamicFormFieldProps>  = ({
    field: {
        name,
        label: fieldLabel,
        custom,
        required,
        options,
        max,
        min,
        maxLength,
    },
    fieldType,
    parentFieldName,
    onChange,
    placeholder,
}) => {
    const addressFieldName = name;
    const fieldInputId = getFormFieldInputId(addressFieldName);
    const fieldName = parentFieldName ? `${parentFieldName}.${name}` : name;
    const translatedLabelString = LABEL[name];

    const label = useMemo(() => (
        <Label htmlFor={ fieldInputId }>
            { custom ?
                fieldLabel :
                translatedLabelString && <TranslatedString id={ translatedLabelString } /> }
            { !required &&
                <>
                    { '' }
                    <small className="optimizedCheckout-contentSecondary">
                        <TranslatedString id="common.optional_text" />
                    </small>
                </> }
        </Label>
    ), [
        custom,
        fieldInputId,
        fieldLabel,
        required,
        translatedLabelString,
    ]);

    const renderInput = useCallback(({ field }: FieldProps<string>) => (
        <DynamicInput
            { ...field }
            autoComplete={ AUTOCOMPLETE[addressFieldName] }
            fieldType={ fieldType }
            id={ fieldInputId }
            max={ max }
            maxLength={ maxLength || undefined }
            min={ min }
            options={ options && options.items }
            placeholder={ placeholder || (options && options.helperLabel) }
            rows={ options && (options as any).rows }
        />
    ), [
        addressFieldName,
        fieldInputId,
        fieldType,
        max,
        maxLength,
        min,
        options,
        placeholder,
    ]);

    return (
        <div className={ `dynamic-form-field dynamic-form-field--${getFormFieldLegacyName(addressFieldName)}` }>
            { fieldType === DynamicFormFieldType.checkbox ?
                <CheckboxGroupFormField
                    id={ fieldInputId }
                    label={ label }
                    name={ fieldName }
                    onChange={ onChange }
                    options={ (options && options.items) || [] }
                /> :
                <FormField
                    input={ renderInput }
                    label={ label }
                    name={ fieldName }
                    onChange={ onChange }
                /> }
        </div>
    );
};

export default memo(DynamicFormField);
