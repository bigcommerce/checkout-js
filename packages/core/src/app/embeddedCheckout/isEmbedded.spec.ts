import isEmbedded from './isEmbedded';

describe('isEmbedded', () => {
    it('returns true if URL is embedded-checkout', () => {
        expect(isEmbedded('/embedded-checkout')).toBe(true);

        expect(isEmbedded('/embedded-checkout/order-confirmation')).toBe(true);
    });

    it('returns false if URL is not embedded-checkout', () => {
        expect(isEmbedded('/checkout')).toBe(false);

        expect(isEmbedded('/checkout/order-confirmation')).toBe(false);
    });
});
