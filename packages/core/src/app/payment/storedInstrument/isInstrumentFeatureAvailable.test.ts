import { merge } from 'lodash';

import { getStoreConfig } from '../../config/config.mock';
import { getCustomer, getGuestCustomer } from '../../customer/customers.mock';
import { getPaymentMethod } from '../payment-methods.mock';

import isInstrumentFeatureAvailable, {
    type IsInstrumentFeatureAvailableState,
} from './isInstrumentFeatureAvailable';

describe('isInstrumentFeatureAvailable()', () => {
    let state: IsInstrumentFeatureAvailableState;

    beforeEach(() => {
        state = {
            config: merge({}, getStoreConfig(), {
                checkoutSettings: {
                    isCardVaultingEnabled: true,
                },
            }),
            customer: getCustomer(),
            paymentMethod: merge({}, getPaymentMethod(), {
                config: {
                    isVaultingEnabled: true,
                },
            }),
            shouldSavingCardsBeEnabled: true,
        };
    });

    it('returns false if store does not support vaulting', () => {
        expect(
            isInstrumentFeatureAvailable(
                merge({}, state, {
                    config: {
                        checkoutSettings: {
                            isCardVaultingEnabled: false,
                        },
                    },
                }),
            ),
        ).toBe(false);
    });

    it('returns false if payment method does not support vaulting', () => {
        expect(
            isInstrumentFeatureAvailable(
                merge({}, state, {
                    paymentMethod: {
                        config: {
                            isVaultingEnabled: false,
                        },
                    },
                }),
            ),
        ).toBe(false);
    });

    it('returns false if shopper is not logged in', () => {
        expect(
            isInstrumentFeatureAvailable({
                ...state,
                customer: getGuestCustomer(),
            }),
        ).toBe(false);
    });

    it('returns false if shouldSavingCardsBeEnabled argument is false', () => {
        expect(
            isInstrumentFeatureAvailable({
                ...state,
                shouldSavingCardsBeEnabled: false,
            }),
        ).toBe(false);
    });

    it('returns true otherwise', () => {
        expect(isInstrumentFeatureAvailable(state)).toBe(true);
    });
});
