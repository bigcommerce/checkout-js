import { getAddressFormFields } from './formField.mock';
import { moveCountryFieldToTop } from './moveCountryFieldToTop';

const createField = (name: string, id = name) => ({
    custom: false,
    default: '',
    id,
    label: name,
    name,
    required: false,
});

describe('moveCountryFieldToTop()', () => {
    it('returns empty array when given empty array', () => {
        expect(moveCountryFieldToTop([])).toEqual([]);
    });

    it('moves countryCode to the top and keeps the rest in the given order', () => {
        const fields = [
            createField('firstName'),
            createField('company'),
            createField('countryCode'),
            createField('address1'),
            createField('phone'),
            createField('city'),
        ];
        const result = moveCountryFieldToTop(fields);

        expect(result.map((field) => field.name)).toEqual([
            'countryCode',
            'firstName',
            'company',
            'address1',
            'phone',
            'city',
        ]);
    });

    it('keeps the given order untouched when countryCode is missing', () => {
        const fields = [createField('company'), createField('firstName'), createField('phone')];
        const result = moveCountryFieldToTop(fields);

        expect(result).toBe(fields);
    });

    it('keeps the given order untouched when countryCode is already first', () => {
        const fields = [createField('countryCode'), createField('phone'), createField('firstName')];
        const result = moveCountryFieldToTop(fields);

        expect(result).toBe(fields);
    });

    it('keeps custom and extra fields in their given position', () => {
        const fields = [
            createField('firstName'),
            { ...createField('field_25'), custom: true },
            createField('countryCode'),
            createField('phone'),
        ];
        const result = moveCountryFieldToTop(fields);

        expect(result.map((field) => field.name)).toEqual([
            'countryCode',
            'firstName',
            'field_25',
            'phone',
        ]);
    });

    it('moves countryCode to the top of real address form fields from mock', () => {
        const fields = getAddressFormFields();
        const result = moveCountryFieldToTop(fields);

        const names = result.map((field) => field.name);
        const restNames = fields
            .filter((field) => field.name !== 'countryCode')
            .map((field) => field.name);

        expect(names[0]).toBe('countryCode');
        expect(names.slice(1)).toEqual(restNames);
        expect(result.length).toBe(fields.length);
    });
});
