import { BraintreeAchInstrument } from '@bigcommerce/checkout-sdk';

import { isBraintreeAchInstrument } from '.';

describe('is braintree ach instrument', () => {
    it('return true if account instrument', () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const instrument = { type: 'ach' } as BraintreeAchInstrument;

        expect(isBraintreeAchInstrument(instrument)).toBe(true);
    });
});
