import { getBankInstrument, getCardInstrument } from '@bigcommerce/checkout/test-mocks';

import { isSepaInstrument } from '.';

describe('is account instrument', () => {
    it('returns true for bank instruments', () => {
        expect(isSepaInstrument({ ...getBankInstrument(), method: 'sepa_direct_debit' })).toBe(
            true,
        );
    });

    it('returns false for non bank instruments', () => {
        expect(isSepaInstrument(getCardInstrument())).toBe(false);
    });

    it('returns false for bank instruments', () => {
        expect(isSepaInstrument(getBankInstrument())).toBe(false);
    });

    it('returns false when instrument is undefined', () => {
        expect(isSepaInstrument()).toBe(false);
    });
});
