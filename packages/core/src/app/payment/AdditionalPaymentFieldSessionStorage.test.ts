import { AdditionalPaymentFieldSessionStorage } from './AdditionalPaymentFieldSessionStorage';

describe('AdditionalPaymentFieldSessionStorage', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('writes the value to session storage', () => {
        AdditionalPaymentFieldSessionStorage.set('foo');

        expect(sessionStorage.getItem(AdditionalPaymentFieldSessionStorage.KEY)).toBe('foo');
    });

    it('removes the key when set to an empty string', () => {
        sessionStorage.setItem(AdditionalPaymentFieldSessionStorage.KEY, 'existing');

        AdditionalPaymentFieldSessionStorage.set('');

        expect(sessionStorage.getItem(AdditionalPaymentFieldSessionStorage.KEY)).toBeNull();
    });

    it('returns an empty string when the key is absent', () => {
        expect(AdditionalPaymentFieldSessionStorage.get()).toBe('');
    });

    it('returns the stored value when present', () => {
        sessionStorage.setItem(AdditionalPaymentFieldSessionStorage.KEY, 'hello');

        expect(AdditionalPaymentFieldSessionStorage.get()).toBe('hello');
    });

    it('removes the key on remove()', () => {
        sessionStorage.setItem(AdditionalPaymentFieldSessionStorage.KEY, 'gone soon');

        AdditionalPaymentFieldSessionStorage.remove();

        expect(sessionStorage.getItem(AdditionalPaymentFieldSessionStorage.KEY)).toBeNull();
    });
});
