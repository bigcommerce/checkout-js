import isEmbedded from './isEmbedded';

describe('isEmbedded', () => {
    it('returns true if URL is embedded-checkout', () => {
        expect(isEmbedded('/embedded-checkout'))
            .toEqual(true);

        expect(isEmbedded('/embedded-checkout/order-confirmation'))
            .toEqual(true);
    });

    it('returns false if URL is not embedded-checkout', () => {
        expect(isEmbedded('/checkout'))
            .toEqual(false);

        expect(isEmbedded('/checkout/order-confirmation'))
            .toEqual(false);
    });
});
