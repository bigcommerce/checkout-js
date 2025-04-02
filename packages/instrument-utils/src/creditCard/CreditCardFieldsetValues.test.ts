import { hasCreditCardExpiry, hasCreditCardNumber } from './CreditCardFieldsetValues';

describe('CreditCardFieldsetValues', () => {
    describe('hasCreditCardNumber', () => {
        it('should return true for an object with ccNumber property', () => {
            const values = { ccNumber: '1234-5678-9012-3456' };

            expect(hasCreditCardNumber(values)).toBe(true);
        });

        it('should return false for an object without ccNumber property', () => {
            const values = { ccExpiry: '12/12' };

            expect(hasCreditCardNumber(values)).toBe(false);
        });

        it('should return false for non-object values', () => {
            expect(hasCreditCardNumber(null)).toBe(false);
            expect(hasCreditCardNumber(undefined)).toBe(false);
            expect(hasCreditCardNumber(123)).toBe(false);
            expect(hasCreditCardNumber('string')).toBe(false);
            expect(hasCreditCardNumber([])).toBe(false);
        });

        it('should return false for an empty object', () => {
            const values = {};

            expect(hasCreditCardNumber(values)).toBe(false);
        });
    });

    describe('hasCreditCardExpiry', () => {
        it('should return true for an object with ccExpiry property', () => {
            const values = { ccExpiry: '12/12' };

            expect(hasCreditCardExpiry(values)).toBe(true);
        });

        it('should return false for an object without ccExpiry property', () => {
            const values = { ccNumber: '1234-5678-9012-3456' };

            expect(hasCreditCardExpiry(values)).toBe(false);
        });

        it('should return false for non-object values', () => {
            expect(hasCreditCardExpiry(null)).toBe(false);
            expect(hasCreditCardExpiry(undefined)).toBe(false);
            expect(hasCreditCardExpiry(123)).toBe(false);
            expect(hasCreditCardExpiry('string')).toBe(false);
            expect(hasCreditCardExpiry([])).toBe(false);
        });

        it('should return false for an empty object', () => {
            const values = {};

            expect(hasCreditCardExpiry(values)).toBe(false);
        });
    });
});
