import { BankInstrument } from '@bigcommerce/checkout-sdk';

import { assertIsBankInstrument, isBankAccountInstrument } from '.';

describe('is account instrument', () => {
    it('return true if account instrument', () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const instrument = { type: 'bank' } as BankInstrument;

        expect(isBankAccountInstrument(instrument)).toBe(true);
    });

    it('throws error if not a bank instrument', () => {
        expect(() => assertIsBankInstrument(undefined)).toThrow(
            'Is not a bank account instrument.',
        );
    });
});
