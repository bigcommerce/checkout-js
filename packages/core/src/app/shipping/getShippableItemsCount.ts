import { Cart } from '@bigcommerce/checkout-sdk';

import getLineItemsCount from './getLineItemsCount';

export default function getShippableItemsCount(
    cart: Cart,
    isNewMultiShippingUIEnabled = false
): number {
    if (isNewMultiShippingUIEnabled) {
        return getLineItemsCount(cart.lineItems.physicalItems.filter((item) => !item.addedByPromotion && !item.parentId));
    }

    return getLineItemsCount(cart.lineItems.physicalItems.filter((item) => !item.addedByPromotion));
}
