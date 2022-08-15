import unformatCreditCardNumber from './unformatCreditCardNumber';

describe('unformatCreditCardNumber()', () => {
    it('removes credit card number formatting', () => {
        expect(unformatCreditCardNumber('4111 1111 1111 1111')).toBe('4111111111111111');

        expect(unformatCreditCardNumber('3782 822463 10005')).toBe('378282246310005');
    });

    it('unformats credit card number that is partially complete', () => {
        expect(unformatCreditCardNumber('4111 1111')).toBe('41111111');
    });

    it('does not do anything if credit card number is invalid', () => {
        expect(unformatCreditCardNumber('xxxx xxxx 1111 1111')).toBe('xxxx xxxx 1111 1111');
    });
});
