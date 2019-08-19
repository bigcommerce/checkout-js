import { getCart } from '../cart/carts.mock';
import { getPhysicalItem } from '../cart/lineItem.mock';

import { getConsignment } from './consignment.mock';
import findLineItems from './findLineItems';

describe('findLineItems()', () => {
    it('returns empty if couldnt find item', () => {
        expect(findLineItems(
            getCart(),
            getConsignment()
        ))
            .toHaveLength(0);
    });

    it('returns physical item from cart when consignment line item id matches', () => {
        expect(findLineItems(
            getCart(),
            {
                ...getConsignment(),
                lineItemIds: [ getPhysicalItem().id as string ],
            }
        ))
            .toEqual([ getPhysicalItem() ]);
    });
});
