import { getAccountInstrument, getCardInstrument } from './instruments.mock';

import { isCardInstrument } from '.';

describe('isCardInstrument', () => {
    it('returns true for card instruments', () => {
        expect(isCardInstrument(getCardInstrument())).toBeTruthy();
    });

    it('returns false for non card instruments', () => {
        expect(isCardInstrument(getAccountInstrument())).toBeFalsy();
    });
});
