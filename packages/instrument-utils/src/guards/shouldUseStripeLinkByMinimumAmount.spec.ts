import { getCart } from '@bigcommerce/checkout/test-mocks';

import shouldUseStripeLinkByMinimumAmount from './shouldUseStripeLinkByMinimumAmount';

describe('shouldUseStripeLinkByMinimumAmount()', () => {
    const cart = getCart();
    const notSupportedCart = {
        ...cart,
        cartAmount: 0.4,
    };

    it("returns true if cart fulfills Stripe's minimum charge amounts requirement", () => {
        expect(shouldUseStripeLinkByMinimumAmount(cart)).toBe(true);
    });

    it("returns false if cart doesn't fulfill Stripe's minimum charge amounts requirement", () => {
        expect(shouldUseStripeLinkByMinimumAmount(notSupportedCart)).toBe(false);
    });

    it('returns false if currency is not supported by Stripe', () => {
        expect(
            shouldUseStripeLinkByMinimumAmount({
                ...notSupportedCart,
                currency: { ...notSupportedCart.currency, code: 'WRONG' },
            }),
        ).toBe(false);
    });
});
