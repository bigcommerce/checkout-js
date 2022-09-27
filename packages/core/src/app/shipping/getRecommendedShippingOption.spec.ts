import { getConsignment } from './consignment.mock';
import getRecommendedShippingOption from './getRecommendedShippingOption';
import {
    getShippingOption,
    getShippingOptionPickUpStore,
} from './shippingOption/shippingMethod.mock';

describe('getShippabgetRecommendedShippingOptioneLineItems()', () => {
    it('returns falsy if it has no recommended shipping options', () => {
        expect(getRecommendedShippingOption([getShippingOptionPickUpStore()])).toBeFalsy();
    });

    it('returns recommended shipping option when has no shipping option', () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(getRecommendedShippingOption(getConsignment().availableShippingOptions!)).toEqual(
            getShippingOption(),
        );
    });
});
