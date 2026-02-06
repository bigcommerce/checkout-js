import { getAddressFormFields } from './formField.mock';
import { reorderAddressFormFields } from './reorderAddressFormFields';

const createField = (name: string, id = name) => ({
    custom: false,
    default: '',
    id,
    label: name,
    name,
    required: false,
});

describe('reorderAddressFormFields()', () => {
    it('returns empty array when given empty array', () => {
        expect(reorderAddressFormFields([])).toEqual([]);
    });

    it('puts countryCode first, then firstName, lastName, company, address fields, phone last', () => {
        const fields = [
            createField('firstName'),
            createField('countryCode'),
            createField('company'),
            createField('address1'),
            createField('phone'),
            createField('city'),
        ];
        const result = reorderAddressFormFields(fields);

        expect(result.map((f) => f.name)).toEqual([
            'countryCode',
            'firstName',
            'company',
            'address1',
            'city',
            'phone',
        ]);
    });

    it('preserves order of non-special fields (rest)', () => {
        const fields = [
            createField('address2'),
            createField('stateOrProvince'),
            createField('postalCode'),
        ];
        const result = reorderAddressFormFields(fields);

        expect(result.map((f) => f.name)).toEqual([
            'address2',
            'stateOrProvince',
            'postalCode',
        ]);
    });

    it('handles only countryCode and phone', () => {
        const fields = [
            createField('phone'),
            createField('countryCode'),
        ];
        const result = reorderAddressFormFields(fields);

        expect(result.map((f) => f.name)).toEqual(['countryCode', 'phone']);
    });

    it('handles missing countryCode', () => {
        const fields = [
            createField('company'),
            createField('firstName'),
            createField('phone'),
        ];
        const result = reorderAddressFormFields(fields);

        expect(result.map((f) => f.name)).toEqual(['firstName', 'company', 'phone']);
    });

    it('handles missing company', () => {
        const fields = [
            createField('countryCode'),
            createField('firstName'),
            createField('phone'),
        ];
        const result = reorderAddressFormFields(fields);

        expect(result.map((f) => f.name)).toEqual(['countryCode', 'firstName', 'phone']);
    });

    it('handles missing phone', () => {
        const fields = [
            createField('firstName'),
            createField('countryCode'),
            createField('company'),
        ];
        const result = reorderAddressFormFields(fields);

        expect(result.map((f) => f.name)).toEqual(['countryCode', 'firstName', 'company']);
    });

    it('reorders real address form fields from mock', () => {
        const fields = getAddressFormFields();
        const result = reorderAddressFormFields(fields);

        const names = result.map((f) => f.name);

        expect(names.indexOf('countryCode')).toBe(0);
        expect(names.indexOf('firstName')).toBe(1);
        expect(names).toContain('phone');
        expect(result.length).toBe(fields.length);
    });
});
