import { type Cart, type StoreConfig } from '@bigcommerce/checkout-sdk';

import { getCart } from '../cart/carts.mock';
import { getStoreConfig } from '../config/config.mock';

import { getContinueAsGuestButtonLabelId } from './getContinueAsGuestButtonLabelId';

describe('getContinueAsGuestButtonLabelId()', () => {
    let cart: Cart;
    let config: StoreConfig;

    beforeEach(() => {
        cart = getCart();
        config = getStoreConfig();
    });

    it('returns generic continue label when enhancedThemeV1 is disabled', () => {
        expect(getContinueAsGuestButtonLabelId(false, cart, config)).toBe('customer.continue');
    });

    it('returns continue to shipping label when shipping step is not skipped', () => {
        expect(getContinueAsGuestButtonLabelId(true, cart, config)).toBe(
            'customer.continue_to_shipping_action',
        );
    });

    it('returns continue to payment label when cart has digital items only', () => {
        cart.lineItems.physicalItems = [];
        cart.lineItems.customItems = [];

        expect(getContinueAsGuestButtonLabelId(true, cart, config)).toBe(
            'common.continue_to_payment_action',
        );
    });

    it('returns continue to payment label when shipping step is complete', () => {
        expect(getContinueAsGuestButtonLabelId(true, cart, config, true)).toBe(
            'common.continue_to_payment_action',
        );
    });

    it('returns generic continue label when enhancedThemeV1 is disabled even if shipping step is complete', () => {
        expect(getContinueAsGuestButtonLabelId(false, cart, config, true)).toBe(
            'customer.continue',
        );
    });
});
