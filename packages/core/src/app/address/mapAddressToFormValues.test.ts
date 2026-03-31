import { type Address, type FormField } from '@bigcommerce/checkout-sdk';

import { getFormFields } from './formField.mock';
import mapAddressToFormValues from './mapAddressToFormValues';

describe('mapAddressToFormValues', () => {
    it('maps system address fields from address to form values', () => {
        const fields = getFormFields();
        const address = {
            firstName: 'John',
            lastName: 'Doe',
            address1: '123 Main St',
            address2: '',
        } as Address;

        const result = mapAddressToFormValues(fields, address);

        expect(result.firstName).toBe('John');
        expect(result.lastName).toBe('Doe');
        expect(result.address1).toBe('123 Main St');
    });

    it('maps extra fields into result.extraFields using field default value', () => {
        const fields: FormField[] = [
            ...getFormFields(),
            {
                custom: false,
                default: 'Acme Corp',
                id: 'b2bExtraField_100',
                label: 'Company Name',
                name: 'b2bExtraField_100',
                required: false,
            },
            {
                custom: false,
                default: 'Engineering',
                id: 'b2bExtraField_200',
                label: 'Department',
                name: 'b2bExtraField_200',
                required: false,
            },
        ];

        const result = mapAddressToFormValues(fields);

        expect(result.extraFields?.b2bExtraField_100).toBe('Acme Corp');
        expect(result.extraFields?.b2bExtraField_200).toBe('Engineering');
    });

    it('uses empty string when extra field has no default', () => {
        const fields: FormField[] = [
            ...getFormFields(),
            {
                custom: false,
                default: '',
                id: 'b2bExtraField_100',
                label: 'Company Name',
                name: 'b2bExtraField_100',
                required: false,
            },
        ];

        const result = mapAddressToFormValues(fields);

        expect(result.extraFields?.b2bExtraField_100).toBe('');
    });
});
