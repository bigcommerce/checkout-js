import { type CardInstrument } from '@bigcommerce/checkout-sdk';

import { assertIsCardInstrument, isCardInstrument } from '.';

describe('is account instrument', () => {
    it('return true if account instrument', () => {
        const instrument = { type: 'card' } as CardInstrument;

        expect(isCardInstrument(instrument)).toBe(true);
    });

    it('throws error if not a bank instrument', () => {
        expect(() => assertIsCardInstrument(undefined)).toThrow('Is not a card instrument.');
    });
});
