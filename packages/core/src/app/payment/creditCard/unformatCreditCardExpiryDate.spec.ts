import unformatCreditCardExpiryDate from './unformatCreditCardExpiryDate';

describe('unformatCreditCardExpiryDate()', () => {
    it('converts MM / YY date format into expiry date object', () => {
        expect(unformatCreditCardExpiryDate('01 / 30')).toEqual({ month: '01', year: '2030' });

        expect(unformatCreditCardExpiryDate('12 / 30')).toEqual({ month: '12', year: '2030' });
    });

    it('converts MM / YYYY date format into expiry date object', () => {
        expect(unformatCreditCardExpiryDate('01 / 2030')).toEqual({ month: '01', year: '2030' });

        expect(unformatCreditCardExpiryDate('12 / 2030')).toEqual({ month: '12', year: '2030' });
    });

    it('converts M / YY date format into expiry date object', () => {
        expect(unformatCreditCardExpiryDate('1 / 30')).toEqual({ month: '01', year: '2030' });
    });

    it('returns empty expiry date object if date format is invalid', () => {
        expect(unformatCreditCardExpiryDate('fo / ba')).toEqual({ month: '', year: '' });
    });
});
