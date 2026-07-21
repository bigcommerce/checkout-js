import { type FormField } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { DynamicFormField } from '@bigcommerce/checkout/ui';

import { AUTOCOMPLETE, LABEL } from './AddressFormType';
import { getAddressFormFieldInputId } from './getAddressFormFieldInputId';

// The address label is a client-only field — the BC address schema has no such field — so it's
// described with a minimal FormField and rendered through the standard DynamicFormField like every
// other field (floating label, error display, autosave onChange). It's folded into `company` only
// at the write boundary.
const ADDRESS_LABEL_FIELD: FormField = {
    name: 'label',
    id: 'addressLabelInput',
    label: 'Address Label',
    custom: false,
    required: false,
    fieldType: 'text',
    type: 'string',
};

export interface AddressLabelFormFieldProps {
    // The company field from the address schema — rendered next to the label.
    field: FormField;
    parentFieldName?: string;
    inputId?: string;
    isFloatingLabelEnabled?: boolean;
    onChange?(value: string | string[]): void;
}

// Renders the Address Label + Company Name inputs side by side. Both are plain Formik fields; the
// label is folded into `company` only at the write boundary, so there's no encode/decode here.
const AddressLabelFormField: FunctionComponent<AddressLabelFormFieldProps> = ({
    field,
    parentFieldName,
    inputId,
    isFloatingLabelEnabled,
    onChange,
}) => (
    <>
        <DynamicFormField
            extraClass="dynamic-form-field--addressLabel"
            field={ADDRESS_LABEL_FIELD}
            inputId={ADDRESS_LABEL_FIELD.id}
            isFloatingLabelEnabled={isFloatingLabelEnabled}
            label={<TranslatedString id="address.address_label_label" />}
            onChange={onChange}
            parentFieldName={parentFieldName}
        />
        <DynamicFormField
            autocomplete={AUTOCOMPLETE[field.name]}
            extraClass="dynamic-form-field--labelCompany"
            field={field}
            inputId={inputId ?? getAddressFormFieldInputId('company')}
            isFloatingLabelEnabled={isFloatingLabelEnabled}
            label={<TranslatedString id={LABEL[field.name]} />}
            onChange={onChange}
            parentFieldName={parentFieldName}
        />
    </>
);

export default memo(AddressLabelFormField);
