import { type Cart, type StoreConfig } from '@bigcommerce/checkout-sdk';

import { getCart } from '../cart/carts.mock';
import { getStoreConfig } from '../config/config.mock';

import { getContinueAsGuestButtonLabelId } from './utils';

describe('getContinueAsGuestButtonLabelId()', () => {
    let cart: Cart;
    let config: StoreConfig;

    beforeEach(() => {
        cart = getCart();
        config = getStoreConfig();
    });

    it('returns generic continue label when themeV2 is disabled', () => {
        expect(getContinueAsGuestButtonLabelId(false, cart, config)).toBe('customer.continue');
    });

    it('returns continue to shipping label when themeV2 is enabled and items require shipping', () => {
        expect(getContinueAsGuestButtonLabelId(true, cart, config)).toBe(
            'customer.continue_to_shipping_action',
        );
    });

    it('returns continue to payment label when themeV2 is enabled and cart is digital only', () => {
        cart.lineItems.physicalItems = [];
        cart.lineItems.customItems = [];

        expect(getContinueAsGuestButtonLabelId(true, cart, config)).toBe(
            'common.continue_to_payment_action',
        );
    });
});
