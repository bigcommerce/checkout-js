import { FormField, LanguageService } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { DynamicFormField } from '@bigcommerce/checkout/ui';

import { AddressKeyMap } from '../BraintreeAchPaymentForm/BraintreeAchPaymentForm';

const LABEL: AddressKeyMap = {
    address1: 'address.address_line_1_label',
    address2: 'address.address_line_2_label',
    city: 'address.city_label',
    countryCode: 'address.country_label',
    firstName: 'address.first_name_label',
    lastName: 'address.last_name_label',
    postalCode: 'address.postal_code_label',
    stateOrProvinceCode: 'address.state_label',
    accountNumber: 'payment.account_number_label',
    routingNumber: 'payment.account_routing_label',
    businessName: 'payment.business_name_label',
    ownershipType: 'payment.ownership_type_label',
    accountType: 'payment.account_type_label',
};

export interface AchFormFieldsProps {
    handleChange: (fieldId: string) => (value: string) => void;
    fieldValues: FormField[];
    language: LanguageService;
}

const AchFormFields: FunctionComponent<AchFormFieldsProps> = memo(
    ({ handleChange, fieldValues, language }) => (
        <>
            {fieldValues.map((field) => (
                <DynamicFormField
                    extraClass={`dynamic-form-field--${field.id}`}
                    field={field}
                    key={field.id}
                    label={language.translate(LABEL[field.name])}
                    onChange={handleChange(field.id)}
                />
            ))}
        </>
    ),
);

export default AchFormFields;
