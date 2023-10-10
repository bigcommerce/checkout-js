import { getCardInstrument, getCart } from '@bigcommerce/checkout/test-mocks';

import { isInstrumentCardNumberRequired, IsInstrumentCardNumberRequiredState } from '.';

describe('is instrument card number required', () => {
    let state: IsInstrumentCardNumberRequiredState;

    beforeEach(() => {
        state = {
            lineItems: {
                ...getCart().lineItems,
                digitalItems: [],
                giftCertificates: [],
            },
            instrument: {
                ...getCardInstrument(),
                trustedShippingAddress: false,
            },
        };
    });

    it('returns false if no physical items', () => {
        state.lineItems = { ...state.lineItems, physicalItems: [] };

        expect(isInstrumentCardNumberRequired(state)).toBe(false);
    });

    it('returns value based on instrument', () => {
        expect(isInstrumentCardNumberRequired(state)).toBe(true);
    });
});
