import { type useMultiCoupon } from './useMultiCoupon';

export const getUseMultiCouponMock: () => ReturnType<typeof useMultiCoupon> = () => ({
    appliedCoupons: [],
    appliedGiftCertificates: [],
    couponError: null,
    isApplyingCouponOrGiftCertificate: false,
    isCouponFormCollapsed: true,
    isCouponFormDisabled: false,
    uiDetails: {
        shipping: 0,
        shippingBeforeDiscount: 0,
        subtotal: 100,
        discounts: 0,
        discountItems: [],
    },
    applyCouponOrGiftCertificate: jest.fn(),
    removeCoupon: jest.fn(),
    removeGiftCertificate: jest.fn(),
    setCouponError: jest.fn(),
});
