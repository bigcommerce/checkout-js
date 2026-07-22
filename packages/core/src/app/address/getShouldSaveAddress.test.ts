import { type CustomerAddress } from '@bigcommerce/checkout-sdk';

import { getAddress } from './address.mock';
import getShouldSaveAddress from './getShouldSaveAddress';

describe('getShouldSaveAddress', () => {
    it('returns true when no address is provided', () => {
        expect(getShouldSaveAddress()).toBe(true);
    });

    it('returns true when the address has no shouldSaveAddress value', () => {
        expect(getShouldSaveAddress(getAddress())).toBe(true);
    });

    it('returns the explicit shouldSaveAddress value of a checkout address', () => {
        expect(getShouldSaveAddress({ ...getAddress(), shouldSaveAddress: false })).toBe(false);
        expect(getShouldSaveAddress({ ...getAddress(), shouldSaveAddress: true })).toBe(true);
    });

    it('returns false for a saved customer address', () => {
        const customerAddress: CustomerAddress = {
            ...getAddress(),
            id: 1,
            type: 'residential',
        };

        expect(getShouldSaveAddress(customerAddress)).toBe(false);
    });

    it('returns false for a saved customer address even when it carries shouldSaveAddress', () => {
        const customerAddress: CustomerAddress = {
            ...getAddress(),
            id: 1,
            type: 'residential',
            shouldSaveAddress: true,
        };

        expect(getShouldSaveAddress(customerAddress)).toBe(false);
    });
});
