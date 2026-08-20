import { type LanguageService } from '@bigcommerce/checkout-sdk';

import { getCouponErrorMessage } from './getCouponErrorMessage';

describe('getCouponErrorMessage', () => {
    const language = {
        translate: (id: string) => id,
    } as LanguageService;

    const createRequestError = (code: string, message?: string) =>
        Object.assign(new Error('Request failed'), { errors: [{ code, message }] });

    it('returns the minimum order total message for min_purchase errors', () => {
        expect(getCouponErrorMessage(createRequestError('min_purchase'), language)).toBe(
            'redeemable.coupon_min_order_total',
        );
    });

    it('returns the location message for not_applicable errors', () => {
        expect(getCouponErrorMessage(createRequestError('not_applicable'), language)).toBe(
            'redeemable.coupon_location_error',
        );
    });

    it('prefers the message returned by the API for other error codes', () => {
        expect(
            getCouponErrorMessage(
                createRequestError('invalid_coupon', 'Coupon has expired'),
                language,
            ),
        ).toBe('Coupon has expired');
    });

    it('falls back to the error message when the API does not provide one', () => {
        expect(getCouponErrorMessage(createRequestError('unknown_code'), language)).toBe(
            'Request failed',
        );
    });

    it('falls back to the generic invalid code message when there is no message at all', () => {
        const error = Object.assign(new Error(''), { errors: [{ code: 'unknown_code' }] });

        expect(getCouponErrorMessage(error, language)).toBe('redeemable.code_invalid_error');
    });

    it('handles plain errors that carry no error codes', () => {
        expect(getCouponErrorMessage(new Error('Something went wrong'), language)).toBe(
            'Something went wrong',
        );
    });

    it('handles errors with an empty errors array', () => {
        expect(getCouponErrorMessage(Object.assign(new Error(''), { errors: [] }), language)).toBe(
            'redeemable.code_invalid_error',
        );
    });
});
