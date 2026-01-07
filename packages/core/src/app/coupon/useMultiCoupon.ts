import { type Coupon } from '@bigcommerce/checkout-sdk';
import { useState } from 'react';

import { useCheckout, useLocale } from '@bigcommerce/checkout/contexts';

import { EMPTY_ARRAY } from '../common/utility';

import { type AppliedGiftCertificateInfo } from './components';
import { getDiscountItems } from './utils';
import { hasSelectedShippingOptions } from '../shipping';

export interface DiscountItem {
    name: string;
    amount: number;
    testId: string;
}

interface UIDetails {
    subtotal: number;
    discounts: number;
    discountItems: DiscountItem[];
    shipping: number | undefined;
    shippingBeforeDiscount: number | undefined;
}

interface UseMultiCouponValues {
    appliedCoupons: Coupon[];
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
        data: { getConfig, getCheckout, getOrder },
        statuses: { isSubmittingOrder, isPending, isApplyingCoupon, isApplyingGiftCertificate }
    } = checkoutState;
    const { checkoutSettings } = getConfig() ?? {};
    const checkout = getCheckout();
    const order = getOrder();

    if (!checkoutSettings || !(checkout || order)) {
        throw new Error('Checkout or order is not available');
    }

    const shouldDisableCouponForm = isSubmittingOrder() || isPending();

    const appliedCoupons = checkoutState.data.getCoupons() ?? EMPTY_ARRAY;

    const appliedGiftCertificates = checkoutState.data.getGiftCertificates()?.map(({ code, used }) => ({
        code,
        amount: used,
    })) ?? EMPTY_ARRAY;

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


    let uiDetails = {} as UIDetails;

    if(checkout) {
        const allConsignmentsHaveSelectedShippingOption = hasSelectedShippingOptions(checkout.consignments);
        
        uiDetails = {
            subtotal: checkout.subtotal,
            discounts: checkout.displayDiscountTotal,
            discountItems: getDiscountItems(checkout, language),
            shippingBeforeDiscount: allConsignmentsHaveSelectedShippingOption ? checkout.shippingCostBeforeDiscount : undefined,
            shipping: allConsignmentsHaveSelectedShippingOption ? checkout.comparisonShippingCost : undefined,
        }
    }
    
    if(order) {
        uiDetails = {
            subtotal: order.baseAmount,
            discounts: order.displayDiscountTotal,
            discountItems: getDiscountItems(order, language),
            shippingBeforeDiscount: order.shippingCostBeforeDiscount,
            shipping: order.comparisonShippingCost,
        }
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
