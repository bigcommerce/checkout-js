import { getConsignment } from '../consignment.mock';

import hasSelectedShippingOptions from './hasSelectedShippingOptions';

describe('hasSelectedShippingOptions()', () => {
    it('returns false when has no consignments', () => {
        expect(hasSelectedShippingOptions([]))
            .toEqual(false);
    });

    it('returns false when has one consignment without shipping option', () => {
        expect(hasSelectedShippingOptions([
            getConsignment(),
            {
                ...getConsignment(),
                selectedShippingOption: undefined,
            },
        ]))
            .toEqual(false);
    });

    it('returns true when all consignments have shipping options', () => {
        expect(hasSelectedShippingOptions([
            getConsignment(),
            getConsignment(),
        ]))
            .toEqual(true);
    });
});
