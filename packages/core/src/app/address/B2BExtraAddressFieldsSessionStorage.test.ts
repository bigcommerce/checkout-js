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

    describe('removeAll', () => {
        it('removes billing, shipping, order, and consignment keys', () => {
            const fields = { field: 'value' };

            B2BExtraFieldsSessionStorage.setFields(B2BExtraFieldsSessionStorage.BILLING_KEY, fields);
            B2BExtraFieldsSessionStorage.setFields(B2BExtraFieldsSessionStorage.SHIPPING_KEY, fields);
            B2BExtraFieldsSessionStorage.setFields(B2BExtraFieldsSessionStorage.ORDER_KEY, fields);
            B2BExtraFieldsSessionStorage.setFields(
                B2BExtraFieldsSessionStorage.getConsignmentKey('c1'),
                fields,
            );
            B2BExtraFieldsSessionStorage.setFields(
                B2BExtraFieldsSessionStorage.getConsignmentKey('c2'),
                fields,
            );

            B2BExtraFieldsSessionStorage.removeAll();

            expect(B2BExtraFieldsSessionStorage.getFields(B2BExtraFieldsSessionStorage.BILLING_KEY)).toBeUndefined();
            expect(B2BExtraFieldsSessionStorage.getFields(B2BExtraFieldsSessionStorage.SHIPPING_KEY)).toBeUndefined();
            expect(B2BExtraFieldsSessionStorage.getFields(B2BExtraFieldsSessionStorage.ORDER_KEY)).toBeUndefined();
            expect(B2BExtraFieldsSessionStorage.getFields(B2BExtraFieldsSessionStorage.getConsignmentKey('c1'))).toBeUndefined();
            expect(B2BExtraFieldsSessionStorage.getFields(B2BExtraFieldsSessionStorage.getConsignmentKey('c2'))).toBeUndefined();
        });

        it('does not remove unrelated sessionStorage keys', () => {
            sessionStorage.setItem('unrelated', 'data');

            B2BExtraFieldsSessionStorage.setFields(B2BExtraFieldsSessionStorage.BILLING_KEY, { field: 'value' });
            B2BExtraFieldsSessionStorage.removeAll();

            expect(sessionStorage.getItem('unrelated')).toBe('data');
        });
    });
});
