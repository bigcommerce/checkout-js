import {
    getSurchargeRequestBody,
    getSurchargeUrl,
    isSurchargeFee,
    isValidPfToken,
    parseSurchargeResult,
} from './surchargeContract';

describe('surcharge endpoint contract', () => {
    it('builds the URL for a checkout', () => {
        expect(getSurchargeUrl('abc/1')).toBe('/api/storefront/checkouts/abc%2F1/surcharge');
    });

    it('builds a body with the payment method and the pfToken and nothing else', () => {
        expect(
            getSurchargeRequestBody({
                paymentMethod: { id: 'bluesnapdirect', gateway: null },
                pfToken: 'pf-token-1',
            }),
        ).toEqual({
            paymentMethod: { id: 'bluesnapdirect', gateway: null },
            pfToken: 'pf-token-1',
        });
    });

    it.each([
        ['pf-token-1', true],
        ['', false],
        ['   ', false],
        [424242, false],
        [undefined, false],
    ])('pfToken %p is valid: %p', (pfToken, expected) => {
        expect(isValidPfToken(pfToken)).toBe(expected);
    });

    it('parses a surcharge answer', () => {
        expect(
            parseSurchargeResult({
                eligible: true,
                amount: '6.18',
                currency: 'USD',
                rate: 3,
                legalText: 'Legal',
            }),
        ).toEqual({
            eligible: true,
            amount: 6.18,
            currency: 'USD',
            rate: 3,
            legalText: 'Legal',
        });
        expect(parseSurchargeResult({ eligible: false, amount: 0 })).toMatchObject({
            eligible: false,
            amount: 0,
        });
    });

    it.each([
        ['nothing', undefined],
        ['no eligible flag', { amount: 1 }],
        ['a negative amount', { eligible: true, amount: -1 }],
        ['a non-numeric amount', { eligible: true, amount: 'abc' }],
    ])('rejects %s', (_label, body) => {
        expect(parseSurchargeResult(body)).toBeUndefined();
    });

    it('recognises the surcharge fee by its source', () => {
        expect(isSurchargeFee({ source: 'payment_surcharge' })).toBe(true);
        expect(isSurchargeFee({ source: 'other' })).toBe(false);
    });
});
