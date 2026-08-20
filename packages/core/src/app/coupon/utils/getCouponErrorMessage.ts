import { type LanguageService, type RequestError } from '@bigcommerce/checkout-sdk';

type CouponRequestError = Pick<RequestError, 'errors'>;

const isCouponRequestError = (error: Error): error is Error & CouponRequestError =>
    Array.isArray((error as Partial<CouponRequestError>).errors);

export const getCouponErrorMessage = (error: Error, language: LanguageService): string => {
    const [firstError] = isCouponRequestError(error) ? error.errors : [];

    switch (firstError?.code) {
        case 'min_purchase':
            return language.translate('redeemable.coupon_min_order_total');

        case 'not_applicable':
            return language.translate('redeemable.coupon_location_error');

        default:
            return (
                firstError?.message ||
                error.message ||
                language.translate('redeemable.code_invalid_error')
            );
    }
};
