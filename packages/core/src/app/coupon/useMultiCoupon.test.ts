import { act, renderHook } from '@testing-library/react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import { useMultiCoupon } from './useMultiCoupon';

jest.mock('@bigcommerce/checkout/contexts');

describe('useMultiCoupon', () => {
    const applyCoupon = jest.fn();
    const applyGiftCertificate = jest.fn();
    const clearError = jest.fn();
    const removeCoupon = jest.fn();
    const removeGiftCertificate = jest.fn();

    const checkoutService = {
        applyCoupon,
        applyGiftCertificate,
        clearError,
        removeCoupon,
        removeGiftCertificate,
    };

    const checkoutState = {
        data: {
            getConfig: jest.fn(),
            getCoupons: jest.fn(),
            getGiftCertificates: jest.fn(),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useCheckout as jest.Mock).mockReturnValue({
            checkoutService,
            checkoutState,
        });
        checkoutState.data.getConfig.mockReturnValue(getStoreConfig());
        checkoutState.data.getCoupons.mockReturnValue([]);
        checkoutState.data.getGiftCertificates.mockReturnValue([]);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns all expected values from the hook', () => {
        const { result } = renderHook(() => useMultiCoupon());

        expect(result.current.appliedCoupons).toEqual([]);
        expect(result.current.appliedGiftCertificates).toEqual([]);
        expect(result.current.applyCouponOrGiftCertificate).toBeInstanceOf(Function);
        expect(result.current.removeCoupon).toBeInstanceOf(Function);
        expect(result.current.removeGiftCertificate).toBeInstanceOf(Function);
        expect(result.current.isCouponCodeCollapsed).toBe(true);
    });

    it('throws if checkout configuration is not available', () => {
        checkoutState.data.getConfig.mockReturnValue(undefined);

        expect(() => renderHook(() => useMultiCoupon())).toThrow(
            'Checkout configuration is not available'
        );
    });

    describe('appliedCoupons', () => {
        it('returns mapped coupons with code property', () => {
            const coupons = [
                { code: 'COUPON1', id: '1' },
                { code: 'COUPON2', id: '2' },
            ];
            checkoutState.data.getCoupons.mockReturnValue(coupons);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.appliedCoupons).toEqual([
                { code: 'COUPON1' },
                { code: 'COUPON2' },
            ]);
        });

        it('returns empty array when coupons are null', () => {
            checkoutState.data.getCoupons.mockReturnValue(null);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.appliedCoupons).toEqual([]);
        });

        it('returns empty array when coupons are undefined', () => {
            checkoutState.data.getCoupons.mockReturnValue(undefined);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.appliedCoupons).toEqual([]);
        });
    });

    describe('appliedGiftCertificates', () => {
        it('returns mapped gift certificates with code property', () => {
            const giftCertificates = [
                { code: 'GIFT1', id: '1' },
                { code: 'GIFT2', id: '2' },
            ];
            checkoutState.data.getGiftCertificates.mockReturnValue(giftCertificates);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.appliedGiftCertificates).toEqual([
                { code: 'GIFT1' },
                { code: 'GIFT2' },
            ]);
        });

        it('returns empty array when gift certificates are null', () => {
            checkoutState.data.getGiftCertificates.mockReturnValue(null);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.appliedGiftCertificates).toEqual([]);
        });

        it('returns empty array when gift certificates are undefined', () => {
            checkoutState.data.getGiftCertificates.mockReturnValue(undefined);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.appliedGiftCertificates).toEqual([]);
        });
    });

    describe('applyCouponOrGiftCertificate', () => {
        it('applies gift certificate successfully when gift certificate is valid', async () => {
            const code = 'GIFT123';

            applyGiftCertificate.mockResolvedValue(undefined);

            const { result } = renderHook(() => useMultiCoupon());

            await act(async () => {
                await result.current.applyCouponOrGiftCertificate(code);
            });

            expect(applyGiftCertificate).toHaveBeenCalledWith(code);
            expect(applyGiftCertificate).toHaveBeenCalledTimes(1);
            expect(applyCoupon).not.toHaveBeenCalled();
            expect(clearError).not.toHaveBeenCalled();
        });

        it('applies coupon when gift certificate fails with Error instance', async () => {
            const code = 'COUPON123';
            const error = new Error('Invalid gift certificate');

            applyGiftCertificate.mockRejectedValue(error);
            applyCoupon.mockResolvedValue(undefined);
            clearError.mockResolvedValue(undefined);

            const { result } = renderHook(() => useMultiCoupon());

            await act(async () => {
                await result.current.applyCouponOrGiftCertificate(code);
            });

            expect(applyGiftCertificate).toHaveBeenCalledWith(code);
            expect(applyGiftCertificate).toHaveBeenCalledTimes(1);
            expect(clearError).toHaveBeenCalledWith(error);
            expect(clearError).toHaveBeenCalledTimes(1);
            expect(applyCoupon).toHaveBeenCalledWith(code);
            expect(applyCoupon).toHaveBeenCalledTimes(1);
        });

        it('applies coupon when gift certificate fails with non-Error instance', async () => {
            const code = 'COUPON123';
            const error = 'Invalid gift certificate';

            applyGiftCertificate.mockRejectedValue(error);
            applyCoupon.mockResolvedValue(undefined);

            const { result } = renderHook(() => useMultiCoupon());

            await act(async () => {
                await result.current.applyCouponOrGiftCertificate(code);
            });

            expect(applyGiftCertificate).toHaveBeenCalledWith(code);
            expect(applyGiftCertificate).toHaveBeenCalledTimes(1);
            expect(clearError).not.toHaveBeenCalled();
            expect(applyCoupon).toHaveBeenCalledWith(code);
            expect(applyCoupon).toHaveBeenCalledTimes(1);
        });

        it('propagates error when both gift certificate and coupon fail', async () => {
            const code = 'INVALID123';
            const giftCertificateError = new Error('Invalid gift certificate');
            const couponError = new Error('Invalid coupon');

            applyGiftCertificate.mockRejectedValue(giftCertificateError);
            clearError.mockResolvedValue(undefined);
            applyCoupon.mockRejectedValue(couponError);

            const { result } = renderHook(() => useMultiCoupon());

            await expect(
                act(async () => {
                    await result.current.applyCouponOrGiftCertificate(code);
                })
            ).rejects.toThrow('Invalid coupon');

            expect(applyGiftCertificate).toHaveBeenCalledWith(code);
            expect(clearError).toHaveBeenCalledWith(giftCertificateError);
        });
    });

    describe('removeCoupon', () => {
        it('calls checkoutService.removeCoupon with coupon code', async () => {
            const code = 'COUPON123';
            removeCoupon.mockResolvedValue(undefined);

            const { result } = renderHook(() => useMultiCoupon());

            await act(async () => {
                await result.current.removeCoupon(code);
            });

            expect(removeCoupon).toHaveBeenCalledWith(code);
            expect(removeCoupon).toHaveBeenCalledTimes(1);
        });
    });

    describe('removeGiftCertificate', () => {
        it('calls checkoutService.removeGiftCertificate with gift certificate code', async () => {
            const giftCertificateCode = 'GIFT123';
            removeGiftCertificate.mockResolvedValue(undefined);

            const { result } = renderHook(() => useMultiCoupon());

            await act(async () => {
                await result.current.removeGiftCertificate(giftCertificateCode);
            });

            expect(removeGiftCertificate).toHaveBeenCalledWith(giftCertificateCode);
            expect(removeGiftCertificate).toHaveBeenCalledTimes(1);
        });
    });
});

