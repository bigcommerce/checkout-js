import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { merge } from 'lodash';

import { getCart } from '../../cart/carts.mock';
import { getDigitalItem, getGiftCertificateItem } from '../../cart/lineItem.mock';
import { getPaymentMethod } from '../payment-methods.mock';

import { getCardInstrument } from './instruments.mock';
import isInstrumentCardCodeRequired, { IsInstrumentCardCodeRequiredState } from './isInstrumentCardCodeRequired';

describe('isInstrumentCardCodeRequired()', () => {
    let state: IsInstrumentCardCodeRequiredState;

    beforeEach(() => {
        state = {
            lineItems: {
                ...getCart().lineItems,
                digitalItems: [],
                giftCertificates: [],
            },
            instrument: {
                ...getCardInstrument(),
                trustedShippingAddress: true,
            },
            paymentMethod: merge({}, getPaymentMethod(), {
                config: {
                    cardCode: false,
                },
            }),
        };
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

    describe('if shipping address is trusted', () => {
        it('returns true if method is configured to require CVV for using stored instrument', () => {
            expect(isInstrumentCardCodeRequired(merge({}, state, {
                paymentMethod: merge({}, getPaymentMethod(), {
                    config: {
                        isVaultingCvvEnabled: true,
                    },
                }),
            })))
                .toEqual(true);
        });

        it('returns false if method is configured not to require CVV for using stored instrument', () => {
            expect(isInstrumentCardCodeRequired(merge({}, state, {
                paymentMethod: merge({}, getPaymentMethod(), {
                    config: {
                        isVaultingCvvEnabled: false,
                    },
                }),
            })))
                .toEqual(false);
        });
    });

    describe('if shipping address is untrusted', () => {
        let instrument: CardInstrument;

        beforeEach(() => {
            instrument = {
                ...getCardInstrument(),
                trustedShippingAddress: false,
            };
        });

        it('returns true if method is configured to require CVV for using stored instrument', () => {
            expect(isInstrumentCardCodeRequired(merge({}, state, {
                instrument,
                paymentMethod: merge({}, getPaymentMethod(), {
                    config: {
                        cardCode: false,
                        isVaultingCvvEnabled: true,
                    },
                }),
            })))
                .toEqual(true);
        });

        it('returns true if method is configured to require CVV for regular card payment', () => {
            expect(isInstrumentCardCodeRequired(merge({}, state, {
                instrument,
                paymentMethod: merge({}, getPaymentMethod(), {
                    config: {
                        cardCode: true,
                        isVaultingCvvEnabled: false,
                    },
                }),
            })))
                .toEqual(true);
        });

        it('returns false if method is configured not to require CVV for regular card or stored card payment', () => {
            expect(isInstrumentCardCodeRequired(merge({}, state, {
                instrument,
                paymentMethod: merge({}, getPaymentMethod(), {
                    config: {
                        cardCode: false,
                        isVaultingCvvEnabled: false,
                    },
                }),
            })))
                .toEqual(false);
        });
    });
});
