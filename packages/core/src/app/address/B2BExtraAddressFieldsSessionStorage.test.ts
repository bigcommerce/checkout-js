import { B2BExtraFieldsSessionStorage } from './B2BExtraFieldsSessionStorage';

describe('B2BExtraFieldsSessionStorage', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('reassignConsignmentKey', () => {
        it('moves fields from temp key to the real consignment key', () => {
            const fields = { b2bExtraField_100: 'Acme Corp' };

            B2BExtraFieldsSessionStorage.setFields(
                B2BExtraFieldsSessionStorage.getConsignmentKey(''),
                fields,
            );

            B2BExtraFieldsSessionStorage.reassignConsignmentKey('consignment-123');

            expect(
                B2BExtraFieldsSessionStorage.getFields(
                    B2BExtraFieldsSessionStorage.getConsignmentKey('consignment-123'),
                ),
            ).toEqual(fields);
            expect(
                B2BExtraFieldsSessionStorage.getFields(
                    B2BExtraFieldsSessionStorage.getConsignmentKey(''),
                ),
            ).toBeUndefined();
        });

        it('does nothing when temp key has no data', () => {
            B2BExtraFieldsSessionStorage.reassignConsignmentKey('consignment-123');

            expect(
                B2BExtraFieldsSessionStorage.getFields(
                    B2BExtraFieldsSessionStorage.getConsignmentKey('consignment-123'),
                ),
            ).toBeUndefined();
        });
    });
});
