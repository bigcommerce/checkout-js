import { FormField } from '@bigcommerce/checkout-sdk';

export function getCustomerAccountFormFields(): FormField[] {
    return [
        {
            custom: false,
            default: '',
            id: 'field_4',
            label: 'First Name',
            name: 'firstName',
            required: true,
        },
        {
            custom: false,
            default: '',
            id: 'field_3',
            label: 'Last Name',
            name: 'lastName',
            required: true,
        },
        {
            custom: false,
            default: '',
            id: 'field_2',
            label: 'Password',
            requirements: {
                minlength: 5,
                description: '',
                alpha: '[a-zA-Z]',
                numeric: '[0-9]',
            },
            name: 'password',
            required: true,
        },
        {
            custom: false,
            default: '',
            id: 'field_1',
            label: 'Email',
            name: 'email',
            required: true,
        },
    ];
}
