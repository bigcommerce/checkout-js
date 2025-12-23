import { type Checkout, type LanguageService } from '@bigcommerce/checkout-sdk';

import { type DiscountItem } from '../useMultiCoupon';

export const getDiscountItems = (checkout: Checkout, language: LanguageService): DiscountItem[] => {
    const discounts: DiscountItem[] = [];

    const autoPromotionAmount = checkout.orderBasedAutoDiscountTotal;
    const manualDiscountAmount = checkout.manualDiscountTotal;

    if (autoPromotionAmount > 0) {
        discounts.push({
            name: language.translate('redeemable.auto_promotion'),
            amount: autoPromotionAmount,
            testId : 'cart-discount',
        });
    }

    if (manualDiscountAmount > 0) {
        discounts.push({
            name: language.translate('redeemable.manual_discount'),
            amount: manualDiscountAmount,
            testId : 'cart-manual-discount',
        });
    }

    checkout.coupons.forEach((coupon) => {
        const couponName = coupon.displayName ? `${coupon.displayName} (${coupon.code})` : coupon.code;

        discounts.push({
            name: couponName,
            amount: coupon.discountedAmount,
            testId : 'cart-coupon',
        });
    });

    return discounts;
};
