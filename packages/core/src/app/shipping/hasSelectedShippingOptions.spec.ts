import { getConsignment } from './consignment.mock';
import hasSelectedShippingOptions from './hasSelectedShippingOptions';

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

    it('returns true when a consignment has no available shipping options but a selected shipping option', () => {
        expect(
            hasSelectedShippingOptions([
                getConsignment(),
                {
                    ...getConsignment(),
                    availableShippingOptions: [],
                },
            ]),
        ).toBe(true);
    });
});
