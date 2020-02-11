import { FormField } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import DynamicFormField from './DynamicFormField';
import DynamicFormFieldType from './DynamicFormFieldType';

interface AddressFormFieldProps {
    field: FormField;
    parentFieldName?: string;
    placeholder?: string;
    onChange?(value: string | string[]): void;
}

function getDynamicFormFieldType({
    fieldType,
    type,
    secret,
}: FormField): DynamicFormFieldType {
    if (fieldType === 'text') {
        if (type === 'integer') {
            return DynamicFormFieldType.number;
        }

        return secret ?
            DynamicFormFieldType.password :
            DynamicFormFieldType.text;
    }

    return fieldType as DynamicFormFieldType;
}

const AddressFormField: FunctionComponent<AddressFormFieldProps> = ({
    field,
    parentFieldName,
    placeholder,
    onChange,
}) => (
    <DynamicFormField
        field={ field }
        fieldType={ getDynamicFormFieldType(field) }
        onChange={ onChange }
        parentFieldName={ parentFieldName }
        placeholder={ placeholder }
    />
);

export default AddressFormField;
