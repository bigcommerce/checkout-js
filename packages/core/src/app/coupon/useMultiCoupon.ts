import { useCheckout } from '@bigcommerce/checkout/contexts';

import { EMPTY_ARRAY } from '../common/utility';

interface UseMultiCouponValues {
    appliedCoupons: Array<{ code: string }>;
    appliedGiftCertificates: Array<{ code: string }>;
    applyCouponOrGiftCertificate: (code: string) => Promise<void>;
    removeCoupon: (code: string) => Promise<void>;
    removeGiftCertificate: (giftCertificateCode: string) => Promise<void>;
    isCouponCodeCollapsed: boolean;
}

export const useMultiCoupon = (): UseMultiCouponValues => {
    const { checkoutState, checkoutService } = useCheckout();
    const config = checkoutState.data.getConfig();

    if (!config) {
        throw new Error('Checkout configuration is not available');
    }

    const appliedCoupons = checkoutState.data.getCoupons()?.map(({ code }) => ({
        code,
    })) ?? EMPTY_ARRAY;

    const appliedGiftCertificates = checkoutState.data.getGiftCertificates()?.map(({ code }) => ({
        code,
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

    return {
        appliedCoupons,
        appliedGiftCertificates,
        applyCouponOrGiftCertificate,
        removeGiftCertificate,
        removeCoupon,
        isCouponCodeCollapsed: config.checkoutSettings.isCouponCodeCollapsed,
    };
};
