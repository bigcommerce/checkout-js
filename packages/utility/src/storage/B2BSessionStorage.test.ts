import { B2BSessionStorage } from './B2BSessionStorage';

describe('B2BSessionStorage', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('get / set / remove', () => {
        it('returns undefined for a missing key', () => {
            expect(B2BSessionStorage.get(B2BSessionStorage.orderExtraFieldsKey)).toBeUndefined();
        });

        it('round-trips an object through base64-encoded JSON', () => {
            const fields = { costCentre: 'Acme Corp' };

            B2BSessionStorage.set(B2BSessionStorage.billingExtraFieldsKey, fields);

            expect(sessionStorage.getItem(B2BSessionStorage.billingExtraFieldsKey)).toBe(
                btoa(encodeURIComponent(JSON.stringify(fields))),
            );
            expect(B2BSessionStorage.get(B2BSessionStorage.billingExtraFieldsKey)).toEqual(fields);
        });

        it('round-trips a string and defaults to empty via getValue', () => {
            B2BSessionStorage.set(B2BSessionStorage.poNumberKey, 'PO-123');

            expect(B2BSessionStorage.getValue(B2BSessionStorage.poNumberKey)).toBe('PO-123');
            expect(B2BSessionStorage.getValue(B2BSessionStorage.invoiceCommentKey)).toBe('');
        });

        it('round-trips a numeric address id via getAddressId', () => {
            B2BSessionStorage.set(B2BSessionStorage.billingAddressIdKey, 42);

            expect(sessionStorage.getItem(B2BSessionStorage.billingAddressIdKey)).toBe(
                btoa(encodeURIComponent(JSON.stringify(42))),
            );
            expect(B2BSessionStorage.getAddressId(B2BSessionStorage.billingAddressIdKey)).toBe(42);
        });

        it('returns undefined for malformed stored data', () => {
            sessionStorage.setItem(B2BSessionStorage.orderExtraFieldsKey, 'not-base64-json');

            expect(B2BSessionStorage.get(B2BSessionStorage.orderExtraFieldsKey)).toBeUndefined();
        });

        it('removes a stored key', () => {
            B2BSessionStorage.set(B2BSessionStorage.orderExtraFieldsKey, { a: 1 });

            B2BSessionStorage.remove(B2BSessionStorage.orderExtraFieldsKey);

            expect(B2BSessionStorage.get(B2BSessionStorage.orderExtraFieldsKey)).toBeUndefined();
        });
    });

    describe('getAll', () => {
        it('returns string defaults and undefined fields when nothing is stored', () => {
            expect(B2BSessionStorage.getAll()).toEqual({
                poNumber: '',
                additionalPaymentField: '',
                invoiceComment: '',
                orderExtraFields: undefined,
                billingExtraFields: undefined,
                shippingExtraFields: undefined,
                billingAddressId: undefined,
                shippingAddressId: undefined,
            });
        });

        it('reads every stored value with the right type', () => {
            B2BSessionStorage.set(B2BSessionStorage.poNumberKey, 'PO-123');
            B2BSessionStorage.set(B2BSessionStorage.additionalPaymentFieldKey, 'REF-456');
            B2BSessionStorage.set(B2BSessionStorage.invoiceCommentKey, 'note');
            B2BSessionStorage.set(B2BSessionStorage.orderExtraFieldsKey, { costCentre: 'Eng' });
            B2BSessionStorage.set(B2BSessionStorage.billingExtraFieldsKey, { department: 'Fin' });
            B2BSessionStorage.set(B2BSessionStorage.shippingExtraFieldsKey, { dock: 'B7' });
            B2BSessionStorage.set(B2BSessionStorage.billingAddressIdKey, 11);
            B2BSessionStorage.set(B2BSessionStorage.shippingAddressIdKey, 22);

            expect(B2BSessionStorage.getAll()).toEqual({
                poNumber: 'PO-123',
                additionalPaymentField: 'REF-456',
                invoiceComment: 'note',
                orderExtraFields: { costCentre: 'Eng' },
                billingExtraFields: { department: 'Fin' },
                shippingExtraFields: { dock: 'B7' },
                billingAddressId: 11,
                shippingAddressId: 22,
            });
        });
    });

    describe('clearAll', () => {
        it('removes every b2b key (including consignment keys), leaving unrelated keys', () => {
            B2BSessionStorage.set(B2BSessionStorage.poNumberKey, 'PO-123');
            B2BSessionStorage.set(B2BSessionStorage.invoiceCommentKey, 'note');
            B2BSessionStorage.set(B2BSessionStorage.orderExtraFieldsKey, { a: 1 });
            B2BSessionStorage.set(B2BSessionStorage.billingExtraFieldsKey, { b: 2 });
            B2BSessionStorage.set(B2BSessionStorage.shippingExtraFieldsKey, { c: 3 });
            B2BSessionStorage.set(B2BSessionStorage.billingAddressIdKey, 11);
            B2BSessionStorage.set(B2BSessionStorage.shippingAddressIdKey, 22);
            B2BSessionStorage.set(B2BSessionStorage.getConsignmentKey('123'), { d: 4 });
            sessionStorage.setItem('unrelatedKey', 'keep-me');

            B2BSessionStorage.clearAll();

            [
                B2BSessionStorage.poNumberKey,
                B2BSessionStorage.invoiceCommentKey,
                B2BSessionStorage.orderExtraFieldsKey,
                B2BSessionStorage.billingExtraFieldsKey,
                B2BSessionStorage.shippingExtraFieldsKey,
                B2BSessionStorage.billingAddressIdKey,
                B2BSessionStorage.shippingAddressIdKey,
                B2BSessionStorage.getConsignmentKey('123'),
            ].forEach((key) => expect(sessionStorage.getItem(key)).toBeNull());

            expect(sessionStorage.getItem('unrelatedKey')).toBe('keep-me');
        });
    });

    describe('copyShippingToBilling', () => {
        it('copies shipping fields and address id to billing', () => {
            const fields = { costCentre: 'Acme Corp' };

            B2BSessionStorage.set(B2BSessionStorage.shippingExtraFieldsKey, fields);
            B2BSessionStorage.set(B2BSessionStorage.shippingAddressIdKey, 42);

            B2BSessionStorage.copyShippingToBilling();

            expect(B2BSessionStorage.get(B2BSessionStorage.billingExtraFieldsKey)).toEqual(fields);
            expect(B2BSessionStorage.getAddressId(B2BSessionStorage.billingAddressIdKey)).toBe(42);
        });

        it('removes the billing address id when shipping has none', () => {
            B2BSessionStorage.set(B2BSessionStorage.billingAddressIdKey, 99);

            B2BSessionStorage.copyShippingToBilling();

            expect(
                B2BSessionStorage.getAddressId(B2BSessionStorage.billingAddressIdKey),
            ).toBeUndefined();
        });

        it('leaves billing fields untouched when shipping has no fields', () => {
            const billingFields = { department: 'Existing' };

            B2BSessionStorage.set(B2BSessionStorage.billingExtraFieldsKey, billingFields);

            B2BSessionStorage.copyShippingToBilling();

            expect(B2BSessionStorage.get(B2BSessionStorage.billingExtraFieldsKey)).toEqual(
                billingFields,
            );
        });
    });

    describe('reassignConsignmentKey', () => {
        it('moves fields from the temp key to the real consignment key', () => {
            const fields = { costCentre: 'Acme Corp' };

            B2BSessionStorage.set(B2BSessionStorage.getConsignmentKey(''), fields);

            B2BSessionStorage.reassignConsignmentKey('consignment-123');

            expect(
                B2BSessionStorage.get(B2BSessionStorage.getConsignmentKey('consignment-123')),
            ).toEqual(fields);
            expect(B2BSessionStorage.get(B2BSessionStorage.getConsignmentKey(''))).toBeUndefined();
        });

        it('does nothing when the temp key has no data', () => {
            B2BSessionStorage.reassignConsignmentKey('consignment-123');

            expect(
                B2BSessionStorage.get(B2BSessionStorage.getConsignmentKey('consignment-123')),
            ).toBeUndefined();
        });
    });
});
