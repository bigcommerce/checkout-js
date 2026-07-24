import { getCart } from '../cart/carts.mock';
import { getPhysicalItem } from '../cart/lineItem.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';

import shouldShowMultiShippingToggle from './shouldShowMultiShippingToggle';

describe('shouldShowMultiShippingToggle()', () => {
    it('returns false if hasMultiShippingEnabled is false', () => {
        const checkout = getCheckout();
        const config = getStoreConfig();
        const cart = {
            ...getCart(),
            lineItems: {
                ...getCart().lineItems,
                physicalItems: [getPhysicalItem(), getPhysicalItem()],
            },
        };

        config.checkoutSettings.hasMultiShippingEnabled = false;

        expect(shouldShowMultiShippingToggle(checkout, config, cart)).toBe(false);
    });

    it('returns false if there is one or fewer shippable items', () => {
        const checkout = getCheckout();
        const config = getStoreConfig();
        const cart = getCart();

        config.checkoutSettings.hasMultiShippingEnabled = true;

        expect(shouldShowMultiShippingToggle(checkout, config, cart)).toBe(false);
    });

    it('returns true if multi-shipping is enabled and there is more than one shippable item', () => {
        const checkout = getCheckout();
        const config = getStoreConfig();
        const cart = {
            ...getCart(),
            lineItems: {
                ...getCart().lineItems,
                physicalItems: [getPhysicalItem(), getPhysicalItem()],
            },
        };

        config.checkoutSettings.hasMultiShippingEnabled = true;

        expect(shouldShowMultiShippingToggle(checkout, config, cart)).toBe(true);
    });
});
