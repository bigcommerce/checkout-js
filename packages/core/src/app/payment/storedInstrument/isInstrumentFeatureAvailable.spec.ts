import { merge } from 'lodash';

import { getCart } from '../../cart/carts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer, getGuestCustomer } from '../../customer/customers.mock';
import { isUsingMultiShipping } from '../../shipping';
import { getConsignment } from '../../shipping/consignment.mock';
import { getPaymentMethod } from '../payment-methods.mock';

import isInstrumentFeatureAvailable, {
    IsInstrumentFeatureAvailableState,
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
            isUsingMultiShipping: isUsingMultiShipping([getConsignment()], getCart().lineItems),
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

    it('returns false if shopper is checking out with multiple shipping address & the feature for vaulting with multiple shipping is not enabled', () => {
        expect(
            isInstrumentFeatureAvailable({
                ...state,
                isUsingMultiShipping: isUsingMultiShipping(
                    [getConsignment(), getConsignment()],
                    getCart().lineItems,
                ),
            }),
        ).toBe(false);
    });

    it('returns true if shopper is checking out with multiple shipping address & the feature for vaulting with multiple shipping is enabled', () => {
        expect(
            isInstrumentFeatureAvailable({
                ...state,
                config: merge({}, getStoreConfig(), {
                    checkoutSettings: {
                        features: {
                            'PAYMENTS-7667.enable_vaulting_with_multishipping': true,
                        },
                    },
                }),
                isUsingMultiShipping: isUsingMultiShipping(
                    [getConsignment(), getConsignment()],
                    getCart().lineItems,
                ),
            }),
        ).toBe(true);
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
