import { act, renderHook } from '@testing-library/react';

import { useCheckout, useLocale } from '@bigcommerce/checkout/contexts';
import { getConsignment, getDigitalItem, getLocaleContext, getPhysicalItem, getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import { getCheckout } from '../checkout/checkouts.mock';

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
            getCheckout: jest.fn(),
            getCoupons: jest.fn(),
            getGiftCertificates: jest.fn(),
            getOrder: jest.fn(),
        },
        statuses: {
            isApplyingCoupon: jest.fn(),
            isApplyingGiftCertificate: jest.fn(),
            isSubmittingOrder: jest.fn(),
            isPending: jest.fn(),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useCheckout as jest.Mock).mockReturnValue({
            checkoutService,
            checkoutState,
        });
        (useLocale as jest.Mock).mockReturnValue(getLocaleContext());
        checkoutState.data.getConfig.mockReturnValue(getStoreConfig());
        checkoutState.data.getCheckout.mockReturnValue(getCheckout());
        checkoutState.data.getCoupons.mockReturnValue([]);
        checkoutState.data.getGiftCertificates.mockReturnValue([]);
        checkoutState.data.getOrder.mockReturnValue(undefined);
        checkoutState.statuses.isSubmittingOrder.mockReturnValue(false);
        checkoutState.statuses.isPending.mockReturnValue(false);
        checkoutState.statuses.isApplyingCoupon.mockReturnValue(false);
        checkoutState.statuses.isApplyingGiftCertificate.mockReturnValue(false);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns all expected values from the hook', () => {
        const { result } = renderHook(() => useMultiCoupon());

        expect(result.current.appliedCoupons).toEqual([]);
        expect(result.current.appliedGiftCertificates).toEqual([]);
        expect(result.current.applyCouponOrGiftCertificate).toBeInstanceOf(Function);
        expect(result.current.couponError).toBe(null);
        expect(result.current.removeCoupon).toBeInstanceOf(Function);
        expect(result.current.removeGiftCertificate).toBeInstanceOf(Function);
        expect(result.current.setCouponError).toBeInstanceOf(Function);
        expect(result.current.isCouponFormDisabled).toBe(false);
        expect(result.current.isCouponFormCollapsed).toBe(true);
        expect(result.current.uiDetails).toBeDefined();
    });

    it('throws if checkout is not available', () => {
        checkoutState.data.getConfig.mockReturnValue(undefined);

        expect(() => renderHook(() => useMultiCoupon())).toThrow(
            'Checkout or order is not available'
        );
    });

    it('throws if checkout settings are not available', () => {
        checkoutState.data.getConfig.mockReturnValue({});

        expect(() => renderHook(() => useMultiCoupon())).toThrow(
            'Checkout or order is not available'
        );
    });

    it('throws if checkout and order object is not available', () => {
        checkoutState.data.getCheckout.mockReturnValue(undefined);
        checkoutState.data.getOrder.mockReturnValue(undefined);

        expect(() => renderHook(() => useMultiCoupon())).toThrow(
            'Checkout or order is not available'
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
                { code: 'COUPON1', id: '1' },
                { code: 'COUPON2', id: '2' },
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
        it('returns mapped gift certificates with code and amount properties', () => {
            const giftCertificates = [
                { code: 'GIFT1', id: '1', used: 10 },
                { code: 'GIFT2', id: '2', used: 20 },
            ];

            checkoutState.data.getGiftCertificates.mockReturnValue(giftCertificates);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.appliedGiftCertificates).toEqual([
                { code: 'GIFT1', amount: 10 },
                { code: 'GIFT2', amount: 20 },
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

    describe('couponError', () => {
        it('initializes with null error', () => {
            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.couponError).toBe(null);
        });

        it('sets error when setCouponError is called', () => {
            const { result } = renderHook(() => useMultiCoupon());

            act(() => {
                result.current.setCouponError('Test error message');
            });

            expect(result.current.couponError).toBe('Test error message');
        });

        it('clears error when setCouponError is called with null', () => {
            const { result } = renderHook(() => useMultiCoupon());

            act(() => {
                result.current.setCouponError('Test error message');
            });

            expect(result.current.couponError).toBe('Test error message');

            act(() => {
                result.current.setCouponError(null);
            });

            expect(result.current.couponError).toBe(null);
        });
    });

    describe('shouldDisableCouponForm', () => {
        it('returns false when order is not being submitted and not pending', () => {
            checkoutState.statuses.isSubmittingOrder.mockReturnValue(false);
            checkoutState.statuses.isPending.mockReturnValue(false);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.isCouponFormDisabled).toBe(false);
        });

        it('returns true when order is being submitted', () => {
            checkoutState.statuses.isSubmittingOrder.mockReturnValue(true);
            checkoutState.statuses.isPending.mockReturnValue(false);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.isCouponFormDisabled).toBe(true);
        });

        it('returns true when order is pending', () => {
            checkoutState.statuses.isSubmittingOrder.mockReturnValue(false);
            checkoutState.statuses.isPending.mockReturnValue(true);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.isCouponFormDisabled).toBe(true);
        });

        it('returns true when both submitting and pending', () => {
            checkoutState.statuses.isSubmittingOrder.mockReturnValue(true);
            checkoutState.statuses.isPending.mockReturnValue(true);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.isCouponFormDisabled).toBe(true);
        });
    });

    describe('isCouponFormCollapsed', () => {
        it('returns value from checkoutSettings.isCouponCodeCollapsed', () => {
            const config = getStoreConfig();

            config.checkoutSettings.isCouponCodeCollapsed = false;
            checkoutState.data.getConfig.mockReturnValue(config);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.isCouponFormCollapsed).toBe(false);
        });
    });

    describe('uiDetails', () => {

        it('returns correct uiDetails structure when consignments information is complete', () => {
            const checkout = {
                ...getCheckout(),
                consignments: [{
                    ...getConsignment(),
                    lineItemIds: [
                        getPhysicalItem().id.toString(),
                        getDigitalItem().id.toString(),
                    ]
                }],
            }

            checkoutState.data.getCheckout.mockReturnValue(checkout);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.uiDetails).toHaveProperty('subtotal');
            expect(result.current.uiDetails).toHaveProperty('discounts');
            expect(result.current.uiDetails).toHaveProperty('discountItems');
            expect(result.current.uiDetails).toHaveProperty('shipping');
            expect(result.current.uiDetails).toHaveProperty('shippingBeforeDiscount');
            expect(result.current.uiDetails.subtotal).toBe(checkout.subtotal);
            expect(result.current.uiDetails.discounts).toBe(checkout.displayDiscountTotal);
            expect(result.current.uiDetails.shipping).toBe(checkout.comparisonShippingCost);
            expect(result.current.uiDetails.shippingBeforeDiscount).toBe(checkout.shippingCostBeforeDiscount);
        });
        
        it('returns correct uiDetails structure when consignments information is incomplete', () => {
            const checkout = getCheckout();

            checkoutState.data.getCheckout.mockReturnValue(checkout);

            const { result } = renderHook(() => useMultiCoupon());

            expect(result.current.uiDetails).toHaveProperty('subtotal');
            expect(result.current.uiDetails).toHaveProperty('discounts');
            expect(result.current.uiDetails).toHaveProperty('discountItems');
            expect(result.current.uiDetails).toHaveProperty('shipping');
            expect(result.current.uiDetails).toHaveProperty('shippingBeforeDiscount');
            expect(result.current.uiDetails.subtotal).toBe(checkout.subtotal);
            expect(result.current.uiDetails.discounts).toBe(checkout.displayDiscountTotal);
            expect(result.current.uiDetails.shipping).toBe(undefined);
            expect(result.current.uiDetails.shippingBeforeDiscount).toBe(undefined);
        });

        describe('discountItems', () => {
            it('includes auto promotion when orderBasedAutoDiscountTotal is greater than 0', () => {
                const checkout = getCheckout();

                checkout.orderBasedAutoDiscountTotal = 10;
                checkoutState.data.getCheckout.mockReturnValue(checkout);

                const { result } = renderHook(() => useMultiCoupon());

                const autoPromotion = result.current.uiDetails.discountItems.find(
                    item => item.amount === 10 && item.name.includes('auto_promotion')
                );

                expect(autoPromotion).toBeDefined();
                expect(autoPromotion?.amount).toBe(10);
                expect(autoPromotion?.name).toBeTruthy();
            });

            it('includes manual discount when manualDiscountTotal is greater than 0', () => {
                const checkout = getCheckout();

                checkout.manualDiscountTotal = 15;
                checkoutState.data.getCheckout.mockReturnValue(checkout);

                const { result } = renderHook(() => useMultiCoupon());

                const manualDiscount = result.current.uiDetails.discountItems.find(
                    item => item.amount === 15 && item.name.includes('manual_discount')
                );

                expect(manualDiscount).toBeDefined();
                expect(manualDiscount?.amount).toBe(15);
                expect(manualDiscount?.name).toBeTruthy();
            });

            it('includes coupons with displayName and code', () => {
                const checkout = getCheckout();

                checkout.coupons = [
                    {
                        code: 'SAVE10',
                        displayName: 'Save 10%',
                        couponType: 'promotion',
                        discountedAmount: 20,
                        id: '1',
                    },
                ];
                checkoutState.data.getCheckout.mockReturnValue(checkout);

                const { result } = renderHook(() => useMultiCoupon());

                const couponItem = result.current.uiDetails.discountItems.find(
                    item => item.name === 'Save 10% (SAVE10)'
                );

                expect(couponItem).toBeDefined();
                expect(couponItem?.amount).toBe(20);
            });

            it('includes coupons with code only when displayName is not available', () => {
                const checkout = getCheckout();

                checkout.coupons = [
                    {
                        code: 'SAVE10',
                        couponType: 'promotion',
                        discountedAmount: 20,
                        id: '1',
                    } as typeof checkout.coupons[0],
                ];
                checkoutState.data.getCheckout.mockReturnValue(checkout);

                const { result } = renderHook(() => useMultiCoupon());

                const couponItem = result.current.uiDetails.discountItems.find(
                    item => item.name === 'SAVE10'
                );

                expect(couponItem).toBeDefined();
                expect(couponItem?.amount).toBe(20);
            });

            it('includes all discount types when present', () => {
                const checkout = getCheckout();

                checkout.orderBasedAutoDiscountTotal = 10;
                checkout.manualDiscountTotal = 15;
                checkout.coupons = [
                    {
                        code: 'SAVE10',
                        displayName: 'Save 10%',
                        couponType: 'promotion',
                        discountedAmount: 20,
                        id: '1',
                    },
                ];
                checkoutState.data.getCheckout.mockReturnValue(checkout);

                const { result } = renderHook(() => useMultiCoupon());

                expect(result.current.uiDetails.discountItems).toHaveLength(3);
                expect(result.current.uiDetails.discountItems.some(
                    item => item.amount === 10 && item.name.includes('auto_promotion')
                )).toBe(true);
                expect(result.current.uiDetails.discountItems.some(
                    item => item.amount === 15 && item.name.includes('manual_discount')
                )).toBe(true);
                expect(result.current.uiDetails.discountItems.some(
                    item => item.name === 'Save 10% (SAVE10)'
                )).toBe(true);
            });

            it('excludes auto promotion when orderBasedAutoDiscountTotal is 0', () => {
                const checkout = getCheckout();

                checkout.orderBasedAutoDiscountTotal = 0;
                checkoutState.data.getCheckout.mockReturnValue(checkout);

                const { result } = renderHook(() => useMultiCoupon());

                const autoPromotion = result.current.uiDetails.discountItems.find(
                    item => item.name.includes('auto_promotion')
                );

                expect(autoPromotion).toBeUndefined();
            });

            it('excludes manual discount when manualDiscountTotal is 0', () => {
                const checkout = getCheckout();

                checkout.manualDiscountTotal = 0;
                checkoutState.data.getCheckout.mockReturnValue(checkout);

                const { result } = renderHook(() => useMultiCoupon());

                const manualDiscount = result.current.uiDetails.discountItems.find(
                    item => item.name.includes('manual_discount')
                );

                expect(manualDiscount).toBeUndefined();
            });
        });
    });
});

