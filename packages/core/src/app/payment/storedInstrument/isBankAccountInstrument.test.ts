import { getBankInstrument, getCardInstrument } from './instruments.mock';

import { isBankAccountInstrument } from '.';

describe('isBankAccountInstrument', () => {
    it('returns true for bank instruments', () => {
        expect(isBankAccountInstrument(getBankInstrument())).toBeTruthy();
    });

    it('returns false for non bank instruments', () => {
        expect(isBankAccountInstrument(getCardInstrument())).toBeFalsy();
    });
});
