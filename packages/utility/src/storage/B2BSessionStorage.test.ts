import { B2BSessionStorage } from './B2BSessionStorage';

describe('B2BSessionStorage', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('setAddressIds / getAddressIds', () => {
        it('returns undefined ids when nothing is stored', () => {
            expect(B2BSessionStorage.getAddressIds()).toEqual({
                billingAddressId: undefined,
                shippingAddressId: undefined,
            });
        });

        it('round-trips both ids through base64-encoded JSON', () => {
            B2BSessionStorage.setAddressIds({ billingAddressId: 11, shippingAddressId: 22 });

            expect(sessionStorage.getItem(B2BSessionStorage.billingAddressIdKey)).toBe(
                btoa(encodeURIComponent(JSON.stringify(11))),
            );
            expect(B2BSessionStorage.getAddressIds()).toEqual({
                billingAddressId: 11,
                shippingAddressId: 22,
            });
        });

        it('removes a previously stored id when the new value is missing', () => {
            B2BSessionStorage.setAddressIds({ billingAddressId: 11, shippingAddressId: 22 });

            B2BSessionStorage.setAddressIds({ shippingAddressId: 33 });

            expect(B2BSessionStorage.getAddressIds()).toEqual({
                billingAddressId: undefined,
                shippingAddressId: 33,
            });
        });

        it('returns undefined for malformed stored data', () => {
            sessionStorage.setItem(B2BSessionStorage.billingAddressIdKey, 'not-base64-json');

            expect(B2BSessionStorage.getAddressIds().billingAddressId).toBeUndefined();
        });

        it('returns undefined for stored data that is not a number', () => {
            sessionStorage.setItem(
                B2BSessionStorage.shippingAddressIdKey,
                btoa(encodeURIComponent(JSON.stringify('not-a-number'))),
            );

            expect(B2BSessionStorage.getAddressIds().shippingAddressId).toBeUndefined();
        });
    });

    describe('setPaymentValues / getPaymentValues', () => {
        it('returns undefined when nothing is stored', () => {
            expect(B2BSessionStorage.getPaymentValues()).toBeUndefined();
        });

        it('round-trips the captured payment form values', () => {
            const values = {
                poNumber: 'PO-123',
                invoicePaymentComment: 'Please rush this order',
                additionalPaymentField: 'REF-456',
                orderExtraFields: { costCentre: 'Engineering' },
            };

            B2BSessionStorage.setPaymentValues(values);

            expect(B2BSessionStorage.getPaymentValues()).toEqual(values);
        });

        it('returns undefined for malformed stored data', () => {
            sessionStorage.setItem(B2BSessionStorage.paymentValuesKey, 'not-base64-json');

            expect(B2BSessionStorage.getPaymentValues()).toBeUndefined();
        });
    });

    describe('clearAll', () => {
        it('removes every b2b key, leaving unrelated keys', () => {
            B2BSessionStorage.setAddressIds({ billingAddressId: 11, shippingAddressId: 22 });
            B2BSessionStorage.setPaymentValues({ poNumber: 'PO-123' });
            sessionStorage.setItem('unrelatedKey', 'keep-me');

            B2BSessionStorage.clearAll();

            expect(sessionStorage.getItem(B2BSessionStorage.billingAddressIdKey)).toBeNull();
            expect(sessionStorage.getItem(B2BSessionStorage.shippingAddressIdKey)).toBeNull();
            expect(sessionStorage.getItem(B2BSessionStorage.paymentValuesKey)).toBeNull();
            expect(sessionStorage.getItem('unrelatedKey')).toBe('keep-me');
        });
    });
});
