import { B2BExtraAddressFieldsSessionStorage } from './B2BExtraAddressFieldsSessionStorage';

describe('B2BExtraAddressFieldsSessionStorage', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('reassignConsignmentKey', () => {
        it('moves fields from temp key to the real consignment key', () => {
            const fields = { b2bExtraField_100: 'Acme Corp' };

            B2BExtraAddressFieldsSessionStorage.setFields(
                B2BExtraAddressFieldsSessionStorage.getConsignmentKey(''),
                fields,
            );

            B2BExtraAddressFieldsSessionStorage.reassignConsignmentKey('consignment-123');

            expect(
                B2BExtraAddressFieldsSessionStorage.getFields(
                    B2BExtraAddressFieldsSessionStorage.getConsignmentKey('consignment-123'),
                ),
            ).toEqual(fields);
            expect(
                B2BExtraAddressFieldsSessionStorage.getFields(
                    B2BExtraAddressFieldsSessionStorage.getConsignmentKey(''),
                ),
            ).toBeUndefined();
        });

        it('does nothing when temp key has no data', () => {
            B2BExtraAddressFieldsSessionStorage.reassignConsignmentKey('consignment-123');

            expect(
                B2BExtraAddressFieldsSessionStorage.getFields(
                    B2BExtraAddressFieldsSessionStorage.getConsignmentKey('consignment-123'),
                ),
            ).toBeUndefined();
        });
    });
});
