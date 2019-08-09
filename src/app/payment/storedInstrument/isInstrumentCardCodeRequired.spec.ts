import { merge } from 'lodash';

import { getCart } from '../../cart/carts.mock';
import { getDigitalItem, getGiftCertificateItem } from '../../cart/lineItem.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getPaymentMethod } from '../payment-methods.mock';

import isInstrumentCardCodeRequired, { IsInstrumentCardCodeRequiredState } from './isInstrumentCardCodeRequired';

describe('isInstrumentCardCodeRequired()', () => {
    let state: IsInstrumentCardCodeRequiredState;

    beforeEach(() => {
        state = {
            config: merge({}, getStoreConfig(), {
                checkoutSettings: {
                    isTrustedShippingAddressEnabled: true,
                },
            }),
            lineItems: {
                ...getCart().lineItems,
                digitalItems: [],
                giftCertificates: [],
            },
            paymentMethod: merge({}, getPaymentMethod(), {
                config: {
                    cardCode: false,
                },
            }),
        };
    });

    it('returns true if trusted shipping address is not enabled', () => {
        expect(isInstrumentCardCodeRequired(merge({}, state, {
            config: {
                checkoutSettings: {
                    isTrustedShippingAddressEnabled: false,
                },
            },
        })))
            .toEqual(true);
    });

    it('returns true if there is digital item in cart', () => {
        expect(isInstrumentCardCodeRequired(merge({}, state, {
            lineItems: {
                digitalItems: [
                    getDigitalItem(),
                ],
            },
        })))
            .toEqual(true);
    });

    it('returns true if there is gift certificate in cart', () => {
        expect(isInstrumentCardCodeRequired(merge({}, state, {
            lineItems: {
                giftCertificates: [
                    getGiftCertificateItem(),
                ],
            },
        })))
            .toEqual(true);
    });

    it('returns true if payment method requires card code for vaulted instrument', () => {
        expect(isInstrumentCardCodeRequired(merge({}, state, {
            paymentMethod: merge({}, getPaymentMethod(), {
                config: {
                    isVaultingCvvEnabled: true,
                },
            }),
        })))
            .toEqual(true);
    });

    it('returns true if payment method requires card code', () => {
        expect(isInstrumentCardCodeRequired(merge({}, state, {
            paymentMethod: merge({}, getPaymentMethod(), {
                config: {
                    cardCode: true,
                },
            }),
        })))
            .toEqual(true);
    });

    it('returns false otherwise', () => {
        expect(isInstrumentCardCodeRequired(state))
            .toEqual(false);
    });
});
