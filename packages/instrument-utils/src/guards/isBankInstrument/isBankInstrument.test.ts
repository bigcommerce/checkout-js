import { getBankInstrument, getCardInstrument } from '@bigcommerce/checkout/test-mocks';

import { assertIsBankInstrument, isBankAccountInstrument } from '.';

describe('is account instrument', () => {
    it('returns true for bank instruments', () => {
        expect(isBankAccountInstrument(getBankInstrument())).toBe(true);
    });

    it('returns false for non bank instruments', () => {
        expect(isBankAccountInstrument(getCardInstrument())).toBe(false);
    });

    it('returns false when instrument is undefined', () => {
        expect(isBankAccountInstrument()).toBe(false);
    });

    it('throws error if not a bank instrument', () => {
        expect(() => assertIsBankInstrument(undefined)).toThrow(
            'Is not a bank account instrument.',
        );
    });

    it('throws error if instrument is not bank account', () => {
        expect(() => assertIsBankInstrument(getCardInstrument())).toThrow(
            'Is not a bank account instrument.',
        );
    });
});
