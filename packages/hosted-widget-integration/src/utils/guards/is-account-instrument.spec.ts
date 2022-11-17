import { AccountInstrument } from '@bigcommerce/checkout-sdk';

import { isAccountInstrument } from '.';

describe('is account instrument', () => {
    it('return true if account instrument', () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const instrument = { type: 'account' } as AccountInstrument;

        expect(isAccountInstrument(instrument)).toBe(true);
    });
});
