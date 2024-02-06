import { getAchInstrument } from '@bigcommerce/checkout/test-mocks';

import { isAchInstrument } from '.';

describe('is ach instrument', () => {
    it('return true if method is ACH', () => {
        const instrument = getAchInstrument();

        expect(isAchInstrument(instrument)).toBe(true);
    });

    it('return true if if method is ECP', () => {
        expect(isAchInstrument({ ...getAchInstrument(), method: 'ecp' })).toBe(true);
    });
});
