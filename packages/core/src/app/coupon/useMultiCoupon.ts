import { type Coupon } from '@bigcommerce/checkout-sdk';
import { useState } from 'react';

import { useCapabilities, useCheckout, useLocale } from '@bigcommerce/checkout/contexts';

import { EMPTY_ARRAY } from '../common/utility';
import { hasSelectedShippingOptions } from '../shipping';

import { type AppliedGiftCertificateInfo } from './components';
import { getDiscountItems } from './utils';

export interface DiscountItem {
    name: string;
    amount: number;
    testId: string;
    showMaxLimitInfo?: boolean;
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

    const {
        selectedState: {
            config,
            checkout,
            order,
            coupons,
            giftCertificates,
            isSubmittingOrder,
            isPending,
            isApplyingCoupon,
            isApplyingGiftCertificate,
        },
        checkoutService,
    } = useCheckout(({ data, statuses }) => ({
        config: data.getConfig(),
        checkout: data.getCheckout(),
        order: data.getOrder(),
        coupons: data.getCoupons(),
        giftCertificates: data.getGiftCertificates(),
        isSubmittingOrder: statuses.isSubmittingOrder(),
        isPending: statuses.isPending(),
        isApplyingCoupon: statuses.isApplyingCoupon(),
        isApplyingGiftCertificate: statuses.isApplyingGiftCertificate(),
    }));
    const { language } = useLocale();
    const {
        userJourney: { disableCoupon, disableGiftCertificate },
    } = useCapabilities();

    const { checkoutSettings } = config ?? {};

    if (!checkoutSettings || !(checkout || order)) {
        throw new Error('Checkout or order is not available');
    }

    const shouldDisableCouponForm = isSubmittingOrder || isPending;

    const appliedCoupons = coupons ?? EMPTY_ARRAY;

    const appliedGiftCertificates =
        giftCertificates?.map(({ code, used }) => ({
            code,
            amount: used,
        })) ?? EMPTY_ARRAY;

    const applyCouponOrGiftCertificate = async (code: string) => {
        const { applyCoupon, applyGiftCertificate, clearError } = checkoutService;

        if (!disableGiftCertificate) {
            try {
                await applyGiftCertificate(code);

                return;
            } catch (error) {
                if (disableCoupon) {
                    throw error;
                }

                if (error instanceof Error) {
                    await clearError(error);
                }
            }
        }

        await applyCoupon(code);
    };

    const removeCoupon = async (code: string) => {
        await checkoutService.removeCoupon(code);
    };

    const removeGiftCertificate = async (code: string) => {
        await checkoutService.removeGiftCertificate(code);
    };

    let uiDetails = {} as UIDetails;

    if (checkout) {
        const allConsignmentsHaveSelectedShippingOption = hasSelectedShippingOptions(
            checkout.consignments,
        );

        uiDetails = {
            subtotal: checkout.subtotal,
            discounts: checkout.displayDiscountTotal,
            discountItems: getDiscountItems(checkout, language),
            shippingBeforeDiscount: allConsignmentsHaveSelectedShippingOption
                ? checkout.shippingCostBeforeDiscount
                : undefined,
            shipping: allConsignmentsHaveSelectedShippingOption
                ? checkout.comparisonShippingCost
                : undefined,
        };
    }

    if (order) {
        uiDetails = {
            subtotal: order.productAutoDiscountedSubtotal,
            discounts: order.displayDiscountTotal,
            discountItems: getDiscountItems(order, language),
            shippingBeforeDiscount: order.shippingCostBeforeDiscount,
            shipping: order.comparisonShippingCost,
        };
    }

    return {
        appliedCoupons,
        appliedGiftCertificates,
        couponError,
        isApplyingCouponOrGiftCertificate: isApplyingCoupon || isApplyingGiftCertificate,
        isCouponFormCollapsed: checkoutSettings.isCouponCodeCollapsed,
        isCouponFormDisabled: shouldDisableCouponForm,
        uiDetails,
        applyCouponOrGiftCertificate,
        removeCoupon,
        removeGiftCertificate,
        setCouponError,
    };
};
