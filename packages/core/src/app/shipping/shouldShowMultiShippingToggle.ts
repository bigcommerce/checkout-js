import { type Cart, type Checkout, type StoreConfig } from '@bigcommerce/checkout-sdk';

import getShippableItemsCount from './getShippableItemsCount';
import getShippingMethodId from './getShippingMethodId';

export default function shouldShowMultiShippingToggle(
    checkout: Checkout,
    config: StoreConfig,
    cart: Cart,
): boolean {
    return (
        config.checkoutSettings.hasMultiShippingEnabled &&
        !getShippingMethodId(checkout, config) &&
        getShippableItemsCount(cart) > 1
    );
}
