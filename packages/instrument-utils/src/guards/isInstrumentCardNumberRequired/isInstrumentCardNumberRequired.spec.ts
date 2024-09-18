import { getCardInstrument, getCart, getPaymentMethod } from '@bigcommerce/checkout/test-mocks';

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
            paymentMethod: {
                ...getPaymentMethod(),
                config: {
                    cardCode: false,
                },
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

    it('returns false if card number validation unavailable for payment method', () => {
        state.paymentMethod = {
            ...getPaymentMethod(),
            initializationData: {
                isVaultingCardNumberValidationAvailable: false,
            },
        };

        expect(isInstrumentCardNumberRequired(state)).toBe(false);
    });
});
