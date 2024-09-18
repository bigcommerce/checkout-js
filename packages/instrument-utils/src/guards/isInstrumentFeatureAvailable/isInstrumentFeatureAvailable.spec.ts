import { merge } from 'lodash';

import {
    getCustomer,
    getGuestCustomer,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import { isInstrumentFeatureAvailable, IsInstrumentFeatureAvailableState } from '.';

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
            isUsingMultiShipping: false,
            paymentMethod: merge({}, getPaymentMethod(), {
                config: {
                    isVaultingEnabled: true,
                },
            }),
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

    it('returns false if shopper is checking out with multiple shipping address', () => {
        expect(
            isInstrumentFeatureAvailable({
                ...state,
                isUsingMultiShipping: true,
            }),
        ).toBe(false);
    });

    it('returns true otherwise', () => {
        expect(isInstrumentFeatureAvailable(state)).toBe(true);
    });
});
