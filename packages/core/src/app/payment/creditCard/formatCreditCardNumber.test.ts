import formatCreditCardNumber from './formatCreditCardNumber';

describe('formatCreditCardNumber()', () => {
    it('formats Visa credit card number', () => {
        expect(formatCreditCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');

        expect(formatCreditCardNumber('4111 1111 1111 1111234')).toBe('4111 1111 1111 1111234');
    });

    it('formats Mastercard credit card number', () => {
        expect(formatCreditCardNumber('5555555555554444')).toBe('5555 5555 5555 4444');
    });

    it('formats Amex credit card number', () => {
        expect(formatCreditCardNumber('378282246310005')).toBe('3782 822463 10005');
    });

    it('formats Diners Club credit card number', () => {
        expect(formatCreditCardNumber('36259600000004')).toBe('3625 960000 0004');
    });

    it('formats Discover credit card number', () => {
        expect(formatCreditCardNumber('6011111111111117')).toBe('6011 1111 1111 1117');
    });

    it('formats potentially invalid credit card number', () => {
        expect(formatCreditCardNumber('41111')).toBe('4111 1');

        expect(formatCreditCardNumber('5555')).toBe('5555');

        expect(formatCreditCardNumber('37828224631')).toBe('3782 822463 1');
    });

    it('does not format if credit card number cannot be recognized', () => {
        expect(formatCreditCardNumber('99999999')).toBe('99999999');

        expect(formatCreditCardNumber('4111 1111 1111 11112345')).toBe('4111 1111 1111 11112345');
    });
});
