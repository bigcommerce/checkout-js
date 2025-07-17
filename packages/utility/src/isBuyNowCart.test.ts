import { getCheckout } from '@bigcommerce/checkout/test-mocks';

import isBuyNowCart from './isBuyNowCart';

describe('isBuyNowCart', () => {
    const redefineWindowLocation = (search: string) => {
        Object.defineProperty(window, 'location', {
            value: {
                search,
            },
            writable: true,
        });
    };

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
        redefineWindowLocation('?action=buy&products=100:1');

        expect(isBuyNowCart()).toEqual(true);
    });

    it('returns false when URL does not have "action=buy"', () => {
        redefineWindowLocation('');

        expect(isBuyNowCart()).toEqual(false);
    });
});
