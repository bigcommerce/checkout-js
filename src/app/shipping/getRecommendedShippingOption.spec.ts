import { getConsignment } from './consignment.mock';
import getRecommendedShippingOption from './getRecommendedShippingOption';
import { getShippingOption, getShippingOptionPickUpStore } from './shippingOption/shippingMethod.mock';

describe('getShippabgetRecommendedShippingOptioneLineItems()', () => {
    it('returns falsy if it has a selected shipping option', () => {
        expect(getRecommendedShippingOption(getConsignment()))
            .toBeFalsy();
    });

    it('returns falsy if it has no recommended shipping options', () => {
        expect(getRecommendedShippingOption({
            ...getConsignment(),
            availableShippingOptions: [
                getShippingOptionPickUpStore(),
            ],
            selectedShippingOption: undefined,
        }))
            .toBeFalsy();
    });

    it('returns recommended shipping option when has no shipping option', () => {
        expect(getRecommendedShippingOption({
            ...getConsignment(),
            selectedShippingOption: undefined,
        }))
            .toEqual(getShippingOption());
    });
});
