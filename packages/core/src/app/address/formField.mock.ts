import { FormField } from '@bigcommerce/checkout-sdk';

export function getAddressFormFieldsWithCustomRequired(): FormField[] {
    return [
        ...getAddressFormFields(),
        {
            custom: true,
            default: '',
            id: 'foo',
            label: 'foo',
            name: 'foo',
            required: true,
        },
    ];
}

export function getAddressFormFields(): FormField[] {
    return [
        ...getFormFields(),
        {
            custom: false,
            default: '',
            id: 'company',
            label: 'Company',
            name: 'company',
            required: false,
        },
        {
            custom: false,
            default: '',
            id: 'stateOrProvince',
            label: 'Province',
            name: 'stateOrProvince',
            required: false,
        },
        {
            custom: false,
            default: '',
            id: 'stateOrProvinceCode',
            label: 'Province',
            name: 'stateOrProvinceCode',
            required: false,
        },
        {
            custom: false,
            default: '',
            id: 'phone',
            label: 'Phone',
            name: 'phone',
            required: false,
        },
        {
            custom: false,
            default: '',
            id: 'postalCode',
            label: 'Postal Code',
            name: 'postalCode',
            required: false,
        },
        {
            custom: false,
            default: '',
            id: 'city',
            label: 'City',
            name: 'city',
            required: false,
        },
        {
            custom: false,
            default: '',
            id: 'country',
            label: 'Country',
            name: 'country',
            required: false,
        },
        {
            custom: false,
            default: '',
            id: 'countryCode',
            label: 'Country',
            name: 'countryCode',
            required: true,
        },
    ];
}

export function getFormFields(): FormField[] {
    return [
        {
            custom: false,
            default: '',
            id: 'field_14',
            label: 'First Name',
            name: 'firstName',
            required: true,
        },
        {
            custom: false,
            default: '',
            id: 'field_15',
            label: 'Last Name',
            name: 'lastName',
            required: true,
        },
        {
            custom: false,
            default: 'NO PO BOX',
            id: 'field_18',
            label: 'Address Line 1',
            name: 'address1',
            required: true,
        },
        {
            custom: false,
            default: '',
            id: 'field_19',
            label: 'Address Line 2',
            name: 'address2',
            required: false,
        },
        {
            custom: true,
            default: '',
            fieldType: 'text',
            id: 'field_25',
            label: 'Custom message',
            name: 'field_25',
            required: false,
            type: 'string',
        },
        {
            custom: true,
            default: '',
            fieldType: 'dropdown',
            id: 'field_27',
            label: 'Custom dropdown',
            name: 'field_27',
            options: {
                items: [
                    {
                        value: '0',
                        label: 'Foo',
                    },
                    {
                        value: '1',
                        label: 'Bar',
                    },
                ],
            },
            required: false,
            type: 'array',
        },
        {
            custom: true,
            default: undefined,
            fieldType: 'text',
            id: 'field_31',
            label: 'Custom number',
            name: 'field_31',
            required: false,
            type: 'integer',
        },
    ];
}
