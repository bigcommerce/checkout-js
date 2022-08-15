import { getConsignment } from './consignment.mock';
import hasSelectedShippingOptions from './hasSelectedShippingOptions';
import { getShippingOptionPickUpStore } from './shippingOption/shippingMethod.mock';

describe('hasSelectedShippingOptions()', () => {
    it('returns false when has no consignments', () => {
        expect(hasSelectedShippingOptions([])).toBe(false);
    });

    it('returns false when has one consignment without shipping option', () => {
        expect(
            hasSelectedShippingOptions([
                getConsignment(),
                {
                    ...getConsignment(),
                    selectedShippingOption: undefined,
                },
            ]),
        ).toBe(false);
    });

    it('returns true when all consignments have shipping options', () => {
        expect(hasSelectedShippingOptions([getConsignment(), getConsignment()])).toBe(true);
    });

    it('returns false when consignments have no shipping options', () => {
        expect(
            hasSelectedShippingOptions([
                getConsignment(),
                {
                    ...getConsignment(),
                    availableShippingOptions: [],
                },
            ]),
        ).toBe(false);
    });

    it('returns false when consignments have mismatched shipping options', () => {
        expect(
            hasSelectedShippingOptions([
                getConsignment(),
                {
                    ...getConsignment(),
                    availableShippingOptions: [getShippingOptionPickUpStore()],
                },
            ]),
        ).toBe(false);
    });
});
