import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { getPoMethodDisabledReason } from './usePoMethodDisabledReason';

function getChequeMethod(): PaymentMethod {
    return {
        id: 'cheque',
        logoUrl: '',
        method: 'offline',
        supportedCards: [],
        config: { displayName: 'Purchase Order', testMode: false },
        type: 'PAYMENT_TYPE_OFFLINE',
        skipRedirectConfirmationAlert: false,
    };
}

describe('getPoMethodDisabledReason', () => {
    const creditLimitCheck = { creditLimit: 100, currency: 'USD' };
    const poConfig = { creditLimitCheck };

    const baseArgs = {
        method: getChequeMethod(),
        poConfig,
        grandTotal: 50,
        cartCurrencyCode: 'USD',
    };

    it('returns null when method is not cheque', () => {
        const method: PaymentMethod = { ...getChequeMethod(), id: 'authorizenet' };

        expect(getPoMethodDisabledReason({ ...baseArgs, method })).toBeNull();
    });

    it('returns null when poConfig is missing', () => {
        expect(getPoMethodDisabledReason({ ...baseArgs, poConfig: null })).toBeNull();
    });

    it('returns null when creditLimitCheck is null (no limit configured)', () => {
        expect(
            getPoMethodDisabledReason({
                ...baseArgs,
                poConfig: { creditLimitCheck: null },
                grandTotal: 9999,
            }),
        ).toBeNull();
    });

    it('returns null when creditLimitCheck.currency is an empty string', () => {
        expect(
            getPoMethodDisabledReason({
                ...baseArgs,
                poConfig: { creditLimitCheck: { ...creditLimitCheck, currency: '' } },
                cartCurrencyCode: 'EUR',
            }),
        ).toBeNull();
    });

    it('returns null when grandTotal is undefined (data still loading)', () => {
        expect(getPoMethodDisabledReason({ ...baseArgs, grandTotal: undefined })).toBeNull();
    });

    it('returns null when cartCurrencyCode is missing', () => {
        expect(getPoMethodDisabledReason({ ...baseArgs, cartCurrencyCode: undefined })).toBeNull();
    });

    it('returns currencyMismatch when creditLimitCheck.currency differs from cart currency', () => {
        expect(getPoMethodDisabledReason({ ...baseArgs, cartCurrencyCode: 'EUR' })).toBe(
            'currencyMismatch',
        );
    });

    it('treats currency comparison as case-insensitive', () => {
        expect(
            getPoMethodDisabledReason({
                ...baseArgs,
                poConfig: { creditLimitCheck: { ...creditLimitCheck, currency: 'usd' } },
                cartCurrencyCode: 'USD',
            }),
        ).toBeNull();
    });

    it('returns currencyMismatch even when grandTotal exceeds the credit limit (currency wins)', () => {
        expect(
            getPoMethodDisabledReason({
                ...baseArgs,
                cartCurrencyCode: 'EUR',
                grandTotal: 9999,
            }),
        ).toBe('currencyMismatch');
    });

    it('returns creditLimit when grandTotal exceeds the credit limit', () => {
        expect(getPoMethodDisabledReason({ ...baseArgs, grandTotal: 150 })).toBe('creditLimit');
    });

    it('returns null when grandTotal is exactly at the credit limit', () => {
        expect(getPoMethodDisabledReason({ ...baseArgs, grandTotal: 100 })).toBeNull();
    });

    it('returns null when grandTotal is under the limit and currency matches', () => {
        expect(getPoMethodDisabledReason({ ...baseArgs, grandTotal: 50 })).toBeNull();
    });
});
