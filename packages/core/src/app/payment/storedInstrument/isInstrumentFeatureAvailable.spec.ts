import { merge } from 'lodash';

import { getCart } from '../../cart/carts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer, getGuestCustomer } from '../../customer/customers.mock';
import { isUsingMultiShipping } from '../../shipping';
import { getConsignment } from '../../shipping/consignment.mock';
import { getPaymentMethod } from '../payment-methods.mock';

import isInstrumentFeatureAvailable, { IsInstrumentFeatureAvailableState } from './isInstrumentFeatureAvailable';

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
            isUsingMultiShipping: isUsingMultiShipping(
                [getConsignment()],
                getCart().lineItems
            ),
            paymentMethod: merge({}, getPaymentMethod(), {
                config: {
                    isVaultingEnabled: true,
                },
            }),
        };
    });

    it('returns false if store does not support vaulting', () => {
        expect(isInstrumentFeatureAvailable(merge({}, state, {
            config: {
                checkoutSettings: {
                    isCardVaultingEnabled: false,
                },
            },
        })))
            .toEqual(false);
    });

    it('returns false if payment method does not support vaulting', () => {
        expect(isInstrumentFeatureAvailable(merge({}, state, {
            paymentMethod: {
                config: {
                    isVaultingEnabled: false,
                },
            },
        })))
            .toEqual(false);
    });

    it('returns false if shopper is not logged in', () => {
        expect(isInstrumentFeatureAvailable({
            ...state,
            customer: getGuestCustomer(),
        }))
            .toEqual(false);
    });

    it('returns false if shopper is checking out with multiple shipping address', () => {
        expect(isInstrumentFeatureAvailable({
            ...state,
            isUsingMultiShipping: isUsingMultiShipping(
                [getConsignment(), getConsignment()],
                getCart().lineItems
            ),
        }))
            .toEqual(false);
    });

    it('returns true otherwise', () => {
        expect(isInstrumentFeatureAvailable(state))
            .toEqual(true);
    });
});
