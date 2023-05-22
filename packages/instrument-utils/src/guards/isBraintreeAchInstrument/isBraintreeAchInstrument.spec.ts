import { getBraintreeAchInstrument } from '@bigcommerce/checkout/test-utils';

import { isBraintreeAchInstrument } from '.';

describe('is braintree ach instrument', () => {
    it('return true if account instrument', () => {
        const instrument = getBraintreeAchInstrument();

        expect(isBraintreeAchInstrument(instrument)).toBe(true);
    });
});
