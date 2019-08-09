import { FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { TranslatedString } from '../language';
import { FormField, Label } from '../ui/form';

import { getFormFieldInputId, getFormFieldLegacyName } from './util/getFormFieldInputId';
import CheckboxGroupFormField from './CheckboxGroupFormField';
import DynamicInput from './DynamicInput';

export enum DynamicFormFieldType {
    telephone = 'tel',
    dropdown = 'dropdown',
    number = 'number',
    password = 'password',
    checkbox = 'checkbox',
    multiline = 'multiline',
    date = 'date',
    radio = 'radio',
    text = 'text',
}

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
    const label = (
        <Label htmlFor={ fieldInputId }>
            { custom ?
                fieldLabel :
                translatedLabelString && <TranslatedString id={ translatedLabelString } />
            }
            { !required &&
                <> { '' }
                    <small className="optimizedCheckout-contentSecondary">
                        <TranslatedString id="common.optional_text" />
                    </small>
                </>
            }
        </Label>
    );

    return (
        <div className={ `dynamic-form-field dynamic-form-field--${getFormFieldLegacyName(addressFieldName)}` }>
            { fieldType === DynamicFormFieldType.checkbox ?
                <CheckboxGroupFormField
                    onChange={ onChange }
                    name={ fieldName }
                    id={ fieldInputId }
                    label={ label }
                    options={ (options && options.items) || [] }
                /> :
                <FormField
                    name={ fieldName }
                    onChange={ onChange }
                    label={ () => label }
                    input={ props =>
                        <DynamicInput
                            { ...props.field }
                            maxLength={ maxLength || undefined }
                            max={ max }
                            min={ min }
                            placeholder={ placeholder || (options && options.helperLabel) }
                            fieldType={ fieldType }
                            rows={ options && (options as any).rows }
                            options={ options && options.items }
                            autoComplete={ AUTOCOMPLETE[addressFieldName] }
                            id={ fieldInputId }
                        />
                    }
                />
            }
        </div>
    );
};

export default DynamicFormField;
