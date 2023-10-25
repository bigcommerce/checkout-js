import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { EMPTY_ARRAY } from '../common/utility';

import { RedeemableProps } from './Redeemable';

export default function mapToRedeemableProps(
    context: CheckoutContextProps,
): RedeemableProps | null {
    const {
        checkoutService,
        checkoutState: {
            data: { getConfig, getCoupons, getGiftCertificates },
            statuses: {
                isApplyingCoupon,
                isApplyingGiftCertificate,
                isRemovingCoupon,
                isRemovingGiftCertificate,
            },
            errors: {
                getApplyCouponError,
                getApplyGiftCertificateError,
                getRemoveCouponError,
                getRemoveGiftCertificateError,
            },
        },
    } = context;

    const config = getConfig();

    if (!config) {
        return null;
    }

    return {
        appliedRedeemableError: getApplyCouponError() || getApplyGiftCertificateError(),
        applyCoupon: checkoutService.applyCoupon,
        applyGiftCertificate: checkoutService.applyGiftCertificate,
        clearError: checkoutService.clearError,
        coupons: getCoupons() || EMPTY_ARRAY,
        giftCertificates: getGiftCertificates() || EMPTY_ARRAY,
        isApplyingRedeemable: isApplyingCoupon() || isApplyingGiftCertificate(),
        isRemovingCoupon: isRemovingCoupon(),
        isRemovingGiftCertificate: isRemovingGiftCertificate(),
        onRemovedCoupon: checkoutService.removeCoupon,
        onRemovedGiftCertificate: checkoutService.removeGiftCertificate,
        removedRedeemableError: getRemoveCouponError() || getRemoveGiftCertificateError(),
        shouldCollapseCouponCode: config.checkoutSettings.isCouponCodeCollapsed,
    };
}
