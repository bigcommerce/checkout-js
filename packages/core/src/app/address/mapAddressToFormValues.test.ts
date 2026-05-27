import { type Address, type FormField } from '@bigcommerce/checkout-sdk';

import { B2BExtraFieldsSessionStorage } from './B2BExtraFieldsSessionStorage';
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

    it('uses extra field value from address over default', () => {
        const fields: FormField[] = [
            ...getFormFields(),
            {
                custom: false,
                default: 'Default Corp',
                id: 'b2bExtraField_100',
                label: 'Company Name',
                name: 'b2bExtraField_100',
                required: false,
            },
        ];

        const address = {
            firstName: 'John',
            extraFields: [{ fieldId: '100', fieldValue: 'Actual Corp' }],
        } as Address;

        const result = mapAddressToFormValues(fields, address);

        expect(result.extraFields?.b2bExtraField_100).toBe('Actual Corp');
    });

    it('falls back to default when address has no matching extra field', () => {
        const fields: FormField[] = [
            ...getFormFields(),
            {
                custom: false,
                default: 'Default Corp',
                id: 'b2bExtraField_100',
                label: 'Company Name',
                name: 'b2bExtraField_100',
                required: false,
            },
        ];

        const address = {
            firstName: 'John',
            extraFields: [],
        } as Address;

        const result = mapAddressToFormValues(fields, address);

        expect(result.extraFields?.b2bExtraField_100).toBe('Default Corp');
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

    describe('session storage precedence', () => {
        const storageKey = 'test_storage_key';

        const extraField: FormField = {
            custom: false,
            default: 'Default Corp',
            id: 'b2bExtraField_100',
            label: 'Company Name',
            name: 'b2bExtraField_100',
            required: false,
        };

        afterEach(() => {
            B2BExtraFieldsSessionStorage.removeFields(storageKey);
        });

        it('prefers extra field value from address over session storage', () => {
            const fields: FormField[] = [...getFormFields(), extraField];

            B2BExtraFieldsSessionStorage.setFields(storageKey, {
                b2bExtraField_100: 'Stored Corp',
            });

            const address = {
                firstName: 'John',
                extraFields: [{ fieldId: '100', fieldValue: 'Address Corp' }],
            } as Address;

            const result = mapAddressToFormValues(fields, address, storageKey);

            expect(result.extraFields?.b2bExtraField_100).toBe('Address Corp');
        });

        it('falls back to session storage when address has no value for the extra field', () => {
            const fields: FormField[] = [...getFormFields(), extraField];

            B2BExtraFieldsSessionStorage.setFields(storageKey, {
                b2bExtraField_100: 'Stored Corp',
            });

            const address = {
                firstName: 'John',
                extraFields: [],
            } as unknown as Address;

            const result = mapAddressToFormValues(fields, address, storageKey);

            expect(result.extraFields?.b2bExtraField_100).toBe('Stored Corp');
        });
    });
});
