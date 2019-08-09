import { AddressKeyMap } from '../DynamicFormField';

export const ADDRESS_FIELD_IDS: AddressKeyMap = {
    address1: 'addressLine1',
    address2: 'addressLine2',
    postalCode: 'postCode',
    stateOrProvince: 'province',
    stateOrProvinceCode: 'provinceCode',
};

export function getFormFieldLegacyName(name: string): string {
    return `${ADDRESS_FIELD_IDS[name] || name}`;
}

export function getFormFieldInputId(name: string): string {
    return `${getFormFieldLegacyName(name)}Input`;
}
