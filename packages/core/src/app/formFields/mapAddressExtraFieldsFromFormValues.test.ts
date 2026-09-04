import mapAddressExtraFieldsFromFormValues from './mapAddressExtraFieldsFromFormValues';

describe('mapAddressExtraFieldsFromFormValues', () => {
    it('converts extra fields object to array of fieldId/fieldValue pairs, stripping the B2B prefix from the id', () => {
        const extraFields = {
            b2bExtraField_100: 'Acme Corp',
            b2bExtraField_200: 'Engineering',
            b2bExtraField_300: 42,
        };

        const result = mapAddressExtraFieldsFromFormValues(extraFields);

        expect(result).toEqual([
            { fieldId: '100', fieldValue: 'Acme Corp' },
            { fieldId: '200', fieldValue: 'Engineering' },
            { fieldId: '300', fieldValue: 42 },
        ]);
    });

    it('leaves non-prefixed ids untouched', () => {
        const result = mapAddressExtraFieldsFromFormValues({ 100: 'Acme Corp' });

        expect(result).toEqual([{ fieldId: '100', fieldValue: 'Acme Corp' }]);
    });

    it('returns undefined when extraFields is undefined', () => {
        expect(mapAddressExtraFieldsFromFormValues(undefined)).toBeUndefined();
    });

    it('returns empty array when extraFields is empty', () => {
        expect(mapAddressExtraFieldsFromFormValues({})).toEqual([]);
    });
});
