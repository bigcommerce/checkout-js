import formatCreditCardExpiryDate from './formatCreditCardExpiryDate';

describe('formatCreditCardExpiryDate()', () => {
    it('converts date into MM/YY date format', () => {
        expect(formatCreditCardExpiryDate('10/2019')).toBe('10 / 19');
    });

    it('formats partial date value', () => {
        expect(formatCreditCardExpiryDate('10')).toBe('10 / ');
    });

    it('returns month only if there is no year and separator has no trailing space', () => {
        expect(formatCreditCardExpiryDate('10 /')).toBe('10');
    });

    it('surrounds separator with whitespaces', () => {
        expect(formatCreditCardExpiryDate('10/19')).toBe('10 / 19');
    });
});
