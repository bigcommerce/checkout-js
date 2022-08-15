import { Cart } from '@bigcommerce/checkout-sdk';

import getLineItemsCount from './getLineItemsCount';

export default function getShippableItemsCount(cart: Cart): number {
    return getLineItemsCount(cart.lineItems.physicalItems.filter((item) => !item.addedByPromotion));
}
