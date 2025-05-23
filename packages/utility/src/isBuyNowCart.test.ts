import isBuyNowCart from './isBuyNowCart';

describe('isBuyNowCart', () => {
    const redefineWindowLocation = (pathname: string) => {
        Object.defineProperty(window, 'location', {
            value: {
                pathname,
            },
            writable: true,
        });
    };

    it('returns true when the last path name is not "checkout" or "embedded-checkout"', () => {
        redefineWindowLocation('store-url/product-page');

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
});
