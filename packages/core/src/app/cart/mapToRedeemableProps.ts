import { type CheckoutContextProps } from '@bigcommerce/checkout/contexts';

import { type RedeemableProps } from './Redeemable';

export default function mapToRedeemableProps(
    context: CheckoutContextProps,
): RedeemableProps | null {
    const {
        checkoutService,
        checkoutState: {
            data: { getConfig },
            statuses: { isApplyingCoupon, isApplyingGiftCertificate },
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
        isApplyingRedeemable: isApplyingCoupon() || isApplyingGiftCertificate(),
        removedRedeemableError: getRemoveCouponError() || getRemoveGiftCertificateError(),
        shouldCollapseCouponCode: config.checkoutSettings.isCouponCodeCollapsed,
    };
}
