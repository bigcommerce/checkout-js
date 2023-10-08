import { getAchInstrument } from '@bigcommerce/checkout/test-mocks';

import { isAchInstrument } from '.';

describe('is ach instrument', () => {
    it('return true if account instrument', () => {
        const instrument = getAchInstrument();

        expect(isAchInstrument(instrument)).toBe(true);
    });
});
