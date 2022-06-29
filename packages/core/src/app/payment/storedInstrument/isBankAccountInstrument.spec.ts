import { isBankAccountInstrument } from '.';
import { getBankInstrument, getCardInstrument } from './instruments.mock';

describe('isBankAccountInstrument', () => {
    it('returns true for bank instruments', () => {
        expect(isBankAccountInstrument(getBankInstrument())).toBeTruthy();
    });

    it('returns false for non bank instruments', () => {
        expect(isBankAccountInstrument(getCardInstrument())).toBeFalsy();
    });
});
