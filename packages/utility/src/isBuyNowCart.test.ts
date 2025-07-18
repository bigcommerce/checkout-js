import { getCheckout } from '@bigcommerce/checkout/test-mocks';

import isBuyNowCart from './isBuyNowCart';

describe('isBuyNowCart', () => {
    const redefineWindowLocation = (pathname: string, search = '') => {
        Object.defineProperty(window, 'location', {
            value: {
                pathname,
                search,
            },
            writable: true,
        });
    };

    it('returns true when the last path name is not "checkout" or "embedded-checkout"', () => {
        redefineWindowLocation('store-url/checkout/xxxxx-xxxxx-xxxxx');

        expect(isBuyNowCart()).toEqual(true);
    });

    it('returns false when the last path name is "checkout"', () => {
        redefineWindowLocation('store-url/checkout');

        expect(isBuyNowCart()).toEqual(false);
    });

    it('returns false when the last path name is "embedded-checkout"', () => {
        redefineWindowLocation('store-url/embedded-checkout');

        expect(isBuyNowCart()).toEqual(false);
    });

    it('returns true when cart source is "BUY_NOW"', () => {
        const checkout = {
            ...getCheckout(),
            cart: {
                ...getCheckout().cart,
                source: 'BUY_NOW',
            },
        };

        expect(isBuyNowCart(checkout.cart)).toEqual(true);
    });

    it('returns false when cart source is not "BUY_NOW"', () => {
        expect(isBuyNowCart(getCheckout().cart)).toEqual(false);
    });

    it('returns true when URL has "action=buy"', () => {
        redefineWindowLocation('store-url/checkout', '?action=buy&products=100:1');

        expect(isBuyNowCart()).toEqual(true);
    });
});
