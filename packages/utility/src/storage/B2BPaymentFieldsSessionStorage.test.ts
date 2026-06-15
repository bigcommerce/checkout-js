import { B2BPaymentFieldsSessionStorage } from './B2BPaymentFieldsSessionStorage';

describe('B2BPaymentFieldsSessionStorage', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('returns an empty string for a missing key', () => {
        expect(
            B2BPaymentFieldsSessionStorage.get(B2BPaymentFieldsSessionStorage.PO_NUMBER_KEY),
        ).toBe('');
    });

    it('stores and reads a value', () => {
        B2BPaymentFieldsSessionStorage.set(B2BPaymentFieldsSessionStorage.PO_NUMBER_KEY, 'PO-123');

        expect(
            B2BPaymentFieldsSessionStorage.get(B2BPaymentFieldsSessionStorage.PO_NUMBER_KEY),
        ).toBe('PO-123');
    });

    it('removes the key when set with an empty value', () => {
        B2BPaymentFieldsSessionStorage.set(B2BPaymentFieldsSessionStorage.PO_NUMBER_KEY, 'PO-123');

        B2BPaymentFieldsSessionStorage.set(B2BPaymentFieldsSessionStorage.PO_NUMBER_KEY, '');

        expect(sessionStorage.getItem(B2BPaymentFieldsSessionStorage.PO_NUMBER_KEY)).toBeNull();
    });

    it('removes a stored key', () => {
        B2BPaymentFieldsSessionStorage.set(
            B2BPaymentFieldsSessionStorage.INVOICE_COMMENT_KEY,
            'Invoice me',
        );

        B2BPaymentFieldsSessionStorage.remove(B2BPaymentFieldsSessionStorage.INVOICE_COMMENT_KEY);

        expect(
            sessionStorage.getItem(B2BPaymentFieldsSessionStorage.INVOICE_COMMENT_KEY),
        ).toBeNull();
    });

    it('clears every managed key while leaving unrelated keys', () => {
        B2BPaymentFieldsSessionStorage.set(B2BPaymentFieldsSessionStorage.PO_NUMBER_KEY, 'PO-123');
        B2BPaymentFieldsSessionStorage.set(
            B2BPaymentFieldsSessionStorage.ADDITIONAL_PAYMENT_FIELD_KEY,
            'REF-456',
        );
        B2BPaymentFieldsSessionStorage.set(
            B2BPaymentFieldsSessionStorage.INVOICE_COMMENT_KEY,
            'Invoice me',
        );
        sessionStorage.setItem('unrelatedKey', 'keep-me');

        B2BPaymentFieldsSessionStorage.clearAll();

        [
            B2BPaymentFieldsSessionStorage.PO_NUMBER_KEY,
            B2BPaymentFieldsSessionStorage.ADDITIONAL_PAYMENT_FIELD_KEY,
            B2BPaymentFieldsSessionStorage.INVOICE_COMMENT_KEY,
        ].forEach((key) => expect(sessionStorage.getItem(key)).toBeNull());

        expect(sessionStorage.getItem('unrelatedKey')).toBe('keep-me');
    });
});
