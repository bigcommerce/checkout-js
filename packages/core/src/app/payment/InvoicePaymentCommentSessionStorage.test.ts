import { InvoicePaymentCommentSessionStorage } from './InvoicePaymentCommentSessionStorage';

describe('InvoicePaymentCommentSessionStorage', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('writes the value to session storage', () => {
        InvoicePaymentCommentSessionStorage.set('foo');

        expect(sessionStorage.getItem(InvoicePaymentCommentSessionStorage.KEY)).toBe('foo');
    });

    it('removes the key when set to an empty string', () => {
        sessionStorage.setItem(InvoicePaymentCommentSessionStorage.KEY, 'existing');

        InvoicePaymentCommentSessionStorage.set('');

        expect(sessionStorage.getItem(InvoicePaymentCommentSessionStorage.KEY)).toBeNull();
    });

    it('returns an empty string when the key is absent', () => {
        expect(InvoicePaymentCommentSessionStorage.get()).toBe('');
    });

    it('returns the stored value when present', () => {
        sessionStorage.setItem(InvoicePaymentCommentSessionStorage.KEY, 'hello');

        expect(InvoicePaymentCommentSessionStorage.get()).toBe('hello');
    });

    it('removes the key on remove()', () => {
        sessionStorage.setItem(InvoicePaymentCommentSessionStorage.KEY, 'gone soon');

        InvoicePaymentCommentSessionStorage.remove();

        expect(sessionStorage.getItem(InvoicePaymentCommentSessionStorage.KEY)).toBeNull();
    });
});
