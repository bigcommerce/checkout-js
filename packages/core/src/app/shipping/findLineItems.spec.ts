import { map } from 'lodash';

import { getCart } from '../cart/carts.mock';
import { getPhysicalItem, getPicklistItem } from '../cart/lineItem.mock';

import { getConsignment } from './consignment.mock';
import findLineItems from './findLineItems';

describe('findLineItems()', () => {
    it('returns empty if couldnt find item', () => {
        expect(findLineItems(getCart(), getConsignment())).toHaveLength(0);
    });

    it('returns physical item from cart when consignment line item id matches', () => {
        expect(
            findLineItems(getCart(), {
                ...getConsignment(),
                lineItemIds: [getPhysicalItem().id as string],
            }),
        ).toEqual([getPhysicalItem()]);
    });

    it('returns parent item only', () => {
        expect(
            findLineItems(getCart(), {
                ...getConsignment(),
                lineItemIds: map(getPicklistItem(), 'id') as string[],
            }),
        ).toHaveLength(1);
    });
});
