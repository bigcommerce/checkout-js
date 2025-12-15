import { useState } from 'react';

import { useCheckout, useLocale } from '@bigcommerce/checkout/contexts';

import { EMPTY_ARRAY } from '../common/utility';

import { type AppliedGiftCertificateInfo } from './components/AppliedGiftCertificates';

export interface DiscountItem {
    name: string;
    amount: number;
}

interface UIDetails {
    subtotal: number;
    discounts: number;
    discountItems: DiscountItem[];
    shipping: number;
    shippingBeforeDiscount: number;
}

interface UseMultiCouponValues {
    appliedCoupons: Array<{ code: string }>;
    appliedGiftCertificates: AppliedGiftCertificateInfo[];
    couponError: string | null;
    isApplyingCouponOrGiftCertificate: boolean;
    isCouponFormCollapsed: boolean;
    isCouponFormDisabled: boolean;
    uiDetails: UIDetails;
    applyCouponOrGiftCertificate: (code: string) => Promise<void>;
    removeCoupon: (code: string) => Promise<void>;
    removeGiftCertificate: (giftCertificateCode: string) => Promise<void>;
    setCouponError: (error: string | null) => void;
}

export const useMultiCoupon = (): UseMultiCouponValues => {
    const [couponError, setCouponError] = useState<string | null>(null);

    const { checkoutState, checkoutService } = useCheckout();
    const { language } = useLocale();

    const {
        data: { getConfig, getCheckout },
        statuses: { isSubmittingOrder, isPending, isApplyingCoupon, isApplyingGiftCertificate }
    } = checkoutState;
    const { checkoutSettings } = getConfig() ?? {};
    const checkout = getCheckout();

    if (!checkoutSettings || !checkout) {
      throw new Error('Checkout is not available');
    }

    const shouldDisableCouponForm = isSubmittingOrder() || isPending();

    const appliedCoupons = checkoutState.data.getCoupons()?.map(({ code }) => ({
        code
    })) ?? EMPTY_ARRAY;

    const appliedGiftCertificates = checkoutState.data.getGiftCertificates()?.map(({ code, used }) => ({
        code,
        amount: used,
    })) ?? EMPTY_ARRAY;

    const getDiscountItems = () => {
        const coupons: DiscountItem[] = [];

        const autoPromotionAmount = checkout.orderBasedAutoDiscountTotal;
        const manualDiscountAmount = checkout.manualDiscountTotal;

        if (autoPromotionAmount > 0) {
            coupons.push({
                name: language.translate('redeemable.auto_promotion'),
                amount: autoPromotionAmount,
            });
        }

        if (manualDiscountAmount > 0) {
            coupons.push({
                name: language.translate('redeemable.manual_discount'),
                amount: manualDiscountAmount,
            });
        }

        checkout.coupons.forEach((coupon) => {
            const couponName = coupon.displayName ? `${coupon.displayName} (${coupon.code})` : coupon.code;

            coupons.push({
                name: couponName,
                amount: coupon.discountedAmount,
            });
        });

        return coupons;
    };

    const applyCouponOrGiftCertificate = async (code: string) => {
        const {
            applyCoupon,
            applyGiftCertificate,
            clearError,
        } = checkoutService;

        try {
            await applyGiftCertificate(code);
        } catch (error) {
            if (error instanceof Error) {
                await clearError(error);
            }

            await applyCoupon(code);
        }
    };

    const removeCoupon = async (code: string) => {
        await checkoutService.removeCoupon(code);
    };

    const removeGiftCertificate = async (code: string) => {
        await checkoutService.removeGiftCertificate(code);
    };

    const uiDetails = {
        subtotal: checkout.subtotal,
        discounts: checkout.displayDiscountTotal,
        discountItems: getDiscountItems(),
        shippingBeforeDiscount: checkout.shippingCostBeforeDiscount,
        shipping: checkout.comparisonShippingCost,
    }

    return {
        appliedCoupons,
        appliedGiftCertificates,
        couponError,
        isApplyingCouponOrGiftCertificate: isApplyingCoupon() || isApplyingGiftCertificate(),
        isCouponFormCollapsed: checkoutSettings.isCouponCodeCollapsed,
        isCouponFormDisabled: shouldDisableCouponForm,
        uiDetails,
        applyCouponOrGiftCertificate,
        removeCoupon,
        removeGiftCertificate,
        setCouponError,
    };
};
