import { type Address, type FormField } from '@bigcommerce/checkout-sdk';

import { type AddressKeyMap } from './address';
import type AddressType from './AddressType';

export interface AddressFormProps {
    fieldName?: string;
    countryCode?: string;
    formFields: FormField[];
    shouldShowSaveAddress?: boolean;
    onAutocompleteSelect?(address: Partial<Address>): void;
    onAutocompleteToggle?(state: { inputValue: string; isOpen: boolean }): void;
    onChange?(fieldName: string, value: string | string[]): void;
    setFieldValue?(fieldName: string, value: string | string[]): void;
    type: AddressType;
}

export const LABEL: AddressKeyMap = {
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

export const AUTOCOMPLETE: AddressKeyMap = {
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

export const PLACEHOLDER: AddressKeyMap = {
    countryCode: 'address.select_country_action',
    stateOrProvince: 'address.select_state_action',
    stateOrProvinceCode: 'address.select_state_action',
};

export const AUTOCOMPLETE_FIELD_NAME = 'address1';
