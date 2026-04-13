import mapExtraFormFieldsFromFormValues from './mapExtraFormFieldsFromFormValues';

describe('mapExtraFormFieldsFromFormValues', () => {
    it('converts extra fields object to array of fieldId/fieldValue pairs', () => {
        const extraFields = {
            b2bExtraField_100: 'Acme Corp',
            b2bExtraField_200: 'Engineering',
            b2bExtraField_300: 42,
        };

        const result = mapExtraFormFieldsFromFormValues(extraFields);

        expect(result).toEqual([
            { fieldId: 'b2bExtraField_100', fieldValue: 'Acme Corp' },
            { fieldId: 'b2bExtraField_200', fieldValue: 'Engineering' },
            { fieldId: 'b2bExtraField_300', fieldValue: 42 },
        ]);
    });

    it('returns undefined when extraFields is undefined', () => {
        expect(mapExtraFormFieldsFromFormValues(undefined)).toBeUndefined();
    });

    it('returns empty array when extraFields is empty', () => {
        expect(mapExtraFormFieldsFromFormValues({})).toEqual([]);
    });
});
