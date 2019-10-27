import { isCardInstrument } from '.';
import { getAccountInstrument, getCardInstrument } from './instruments.mock';

describe('isCardInstrument', () => {
    it('returns true for card instruments', () => {
        expect(isCardInstrument(getCardInstrument())).toBeTruthy();
    });

    it('returns false for non card instruments', () => {
        expect(isCardInstrument(getAccountInstrument())).toBeFalsy();
    });
});
