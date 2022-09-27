import { AddressKeyMap } from './address';

export const ADDRESS_FIELD_IDS: AddressKeyMap = {
    address1: 'addressLine1',
    address2: 'addressLine2',
    postalCode: 'postCode',
    stateOrProvince: 'province',
    stateOrProvinceCode: 'provinceCode',
};

export function getAddressFormFieldLegacyName(name: string): string {
    return `${ADDRESS_FIELD_IDS[name] || name}`;
}

export function getAddressFormFieldInputId(name: string): string {
    return `${getAddressFormFieldLegacyName(name)}Input`;
}

export function getAddressFormFieldLabelId(name: string): string {
    return `${getAddressFormFieldLegacyName(name)}Label`;
}
