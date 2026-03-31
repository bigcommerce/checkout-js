import { type FormField } from '@bigcommerce/checkout-sdk';

const ADDRESS_FIELD_ORDER = [
    'countryCode',
    'firstName',
    'lastName',
    'company',
    'address1',
    'address2',
    'city',
    'stateOrProvince',
    'stateOrProvinceCode',
    'postalCode',
    'phone',
];
const ORDERED_NAMES = new Set(ADDRESS_FIELD_ORDER);

export function reorderAddressFormFields(formFields: FormField[]): FormField[] {
    const formFieldsMap = new Map(formFields.map((field) => [field.name, field]));

    const reorderedFormFields: FormField[] = [];

    ADDRESS_FIELD_ORDER.forEach((name) => {
        const field = formFieldsMap.get(name);

        if (field) {
            reorderedFormFields.push(field);
        }
    });

    formFields.forEach((field) => {
        if (field.name && !ORDERED_NAMES.has(field.name)) {
            reorderedFormFields.push(field);
        }
    });

    return reorderedFormFields;
}
