import { Cart, Consignment, PhysicalItem } from '@bigcommerce/checkout-sdk';
import { compact, find, isNil, map } from 'lodash';

export default function findLineItems(cart: Cart, consignment: Consignment): PhysicalItem[] {
    return compact(
        map(consignment.lineItemIds, (itemId) =>
            find(
                cart.lineItems.physicalItems,
                (item) => item.id === itemId && isNil(item.parentId),
            ),
        ),
    );
}
