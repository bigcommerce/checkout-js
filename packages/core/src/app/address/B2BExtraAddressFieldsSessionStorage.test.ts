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

    describe('copyShippingToBilling', () => {
        it('copies shipping fields and address id to billing', () => {
            const fields = { b2bExtraField_100: 'Acme Corp' };

            B2BExtraFieldsSessionStorage.setFields(
                B2BExtraFieldsSessionStorage.SHIPPING_KEY,
                fields,
            );
            B2BExtraFieldsSessionStorage.setAddressId(
                B2BExtraFieldsSessionStorage.SHIPPING_ADDRESS_ID_KEY,
                42,
            );

            B2BExtraFieldsSessionStorage.copyShippingToBilling();

            expect(
                B2BExtraFieldsSessionStorage.getFields(B2BExtraFieldsSessionStorage.BILLING_KEY),
            ).toEqual(fields);
            expect(
                B2BExtraFieldsSessionStorage.getAddressId(
                    B2BExtraFieldsSessionStorage.BILLING_ADDRESS_ID_KEY,
                ),
            ).toBe(42);
        });

        it('removes the billing address id when shipping has none', () => {
            B2BExtraFieldsSessionStorage.setAddressId(
                B2BExtraFieldsSessionStorage.BILLING_ADDRESS_ID_KEY,
                99,
            );

            B2BExtraFieldsSessionStorage.copyShippingToBilling();

            expect(
                B2BExtraFieldsSessionStorage.getAddressId(
                    B2BExtraFieldsSessionStorage.BILLING_ADDRESS_ID_KEY,
                ),
            ).toBeUndefined();
        });

        it('leaves billing fields untouched when shipping has no fields', () => {
            const billingFields = { b2bExtraField_200: 'Existing' };

            B2BExtraFieldsSessionStorage.setFields(
                B2BExtraFieldsSessionStorage.BILLING_KEY,
                billingFields,
            );

            B2BExtraFieldsSessionStorage.copyShippingToBilling();

            expect(
                B2BExtraFieldsSessionStorage.getFields(B2BExtraFieldsSessionStorage.BILLING_KEY),
            ).toEqual(billingFields);
        });
    });
});
