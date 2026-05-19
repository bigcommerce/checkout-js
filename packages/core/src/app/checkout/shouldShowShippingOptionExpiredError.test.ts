import { shouldShowShippingOptionExpiredError } from './shouldShowShippingOptionExpiredError';

describe('shouldShowShippingOptionExpiredError', () => {
    const conditions = {
        prevHasSelectedShippingOptions: true,
        newHasSelectedShippingOptions: false,
        isShippingStepFinished: true,
        isSigningOut: false,
    };

    it('returns true when shipping options were lost after the shipping step finished and no sign-out is in progress', () => {
        expect(shouldShowShippingOptionExpiredError(conditions)).toBe(true);
    });

    it('returns false during a wallet sign-out even when shipping options were lost', () => {
        expect(shouldShowShippingOptionExpiredError({ ...conditions, isSigningOut: true })).toBe(
            false,
        );
    });

    it('returns false when shipping options are still present', () => {
        expect(
            shouldShowShippingOptionExpiredError({
                ...conditions,
                newHasSelectedShippingOptions: true,
            }),
        ).toBe(false);
    });

    it('returns false when no shipping option was selected before the update', () => {
        expect(
            shouldShowShippingOptionExpiredError({
                ...conditions,
                prevHasSelectedShippingOptions: false,
            }),
        ).toBe(false);
    });

    it('returns false when the shopper has not yet completed the shipping step', () => {
        expect(
            shouldShowShippingOptionExpiredError({
                ...conditions,
                isShippingStepFinished: false,
            }),
        ).toBe(false);
    });
});
