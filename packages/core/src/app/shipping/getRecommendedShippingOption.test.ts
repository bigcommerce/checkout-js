import { ShippingOption } from '@bigcommerce/checkout-sdk';

import { getConsignment } from './consignment.mock';
import getRecommendedShippingOption from './getRecommendedShippingOption';
import {
    getShippingOption,
    getShippingOptionPickUpStore,
} from './shippingOption/shippingMethod.mock';

describe('getShippabgetRecommendedShippingOptioneLineItems()', () => {
    it('returns undefined if no shipping option available', () => {
        expect(
          getRecommendedShippingOption(undefined as unknown as ShippingOption[]) === undefined,
        ).toBeTruthy();
    });

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
