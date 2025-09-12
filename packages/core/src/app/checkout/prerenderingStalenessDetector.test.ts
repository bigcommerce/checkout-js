import { type CheckoutStoreSelector } from '@bigcommerce/checkout-sdk';

import { createCheckoutRefreshAPI, createPrerenderingChangeHandler, PrerenderingStalenessDetector } from './prerenderingStalenessDetector';

describe('PrerenderingStalenessDetector', () => {
    let detector: PrerenderingStalenessDetector;
    let mockCheckoutData: CheckoutStoreSelector;
    let mockCheckout: any;

    beforeEach(() => {
        detector = new PrerenderingStalenessDetector();
        
        mockCheckout = {
            id: 'checkout-456',
            version: 1,
            updatedTime: '2023-01-01T00:00:00Z',
        };

        mockCheckoutData = {
            getCheckout: jest.fn(() => mockCheckout),
        } as any;
    });

    describe('captureInitialSnapshot', () => {
        it('should capture checkout data snapshot', () => {
            detector.captureInitialSnapshot(mockCheckoutData);

            expect(detector.hasSnapshot()).toBe(true);
        });

        it('should not capture snapshot when checkout is missing', () => {
            (mockCheckoutData.getCheckout as jest.Mock).mockReturnValue(undefined);
            
            detector.captureInitialSnapshot(mockCheckoutData);

            expect(detector.hasSnapshot()).toBe(false);
        });
    });

    describe('isDataStale', () => {
        it('should return false when no snapshot is captured', () => {
            const isStale = detector.isDataStale(mockCheckoutData);

            expect(isStale).toBe(false);
        });

        it('should return false when checkout data has not changed', () => {
            detector.captureInitialSnapshot(mockCheckoutData);

            const isStale = detector.isDataStale(mockCheckoutData);

            expect(isStale).toBe(false);
        });

        it('should return true when checkout ID has changed', () => {
            detector.captureInitialSnapshot(mockCheckoutData);
            
            mockCheckout.id = 'checkout-different';

            const isStale = detector.isDataStale(mockCheckoutData);

            expect(isStale).toBe(true);
        });

        it('should return true when version has changed', () => {
            detector.captureInitialSnapshot(mockCheckoutData);
            
            mockCheckout.version = 2;

            const isStale = detector.isDataStale(mockCheckoutData);

            expect(isStale).toBe(true);
        });

        it('should return false when same checkout ID', () => {
            detector.captureInitialSnapshot(mockCheckoutData);

            const isStale = detector.isDataStale(mockCheckoutData);

            expect(isStale).toBe(false);
        });

        it('should return true when checkout is missing', () => {
            detector.captureInitialSnapshot(mockCheckoutData);
            
            (mockCheckoutData.getCheckout as jest.Mock).mockReturnValue(undefined);

            const isStale = detector.isDataStale(mockCheckoutData);

            expect(isStale).toBe(true);
        });
    });

    describe('reset', () => {
        it('should clear the snapshot', () => {
            detector.captureInitialSnapshot(mockCheckoutData);
            expect(detector.hasSnapshot()).toBe(true);

            detector.reset();
            expect(detector.hasSnapshot()).toBe(false);
        });
    });
});

describe('createPrerenderingChangeHandler', () => {
    let detector: PrerenderingStalenessDetector;
    let mockLoadCheckout: jest.Mock;
    let mockGetCurrentData: jest.Mock;
    let mockOnDataRefreshed: jest.Mock;
    let mockFreshData: CheckoutStoreSelector;

    beforeEach(() => {
        detector = new PrerenderingStalenessDetector();
        mockLoadCheckout = jest.fn();
        mockGetCurrentData = jest.fn();
        mockOnDataRefreshed = jest.fn();
        
        mockFreshData = {
            getCheckout: jest.fn(() => ({ id: 'checkout-fresh', version: 2, updatedTime: '2023-01-02T00:00:00Z' })),
        } as any;

        mockGetCurrentData.mockReturnValue(mockFreshData);
    });

    it('should create a handler that loads fresh checkout data', async () => {
        const utils = createPrerenderingChangeHandler(
            detector,
            mockLoadCheckout,
            mockGetCurrentData,
            'checkout-123',
            mockOnDataRefreshed,
        );

        await utils();

        expect(mockLoadCheckout).toHaveBeenCalledWith('checkout-123', {
            params: {
                include: [
                    'cart.lineItems.physicalItems.categoryNames',
                    'cart.lineItems.digitalItems.categoryNames',
                ],
            },
        });
    });

    it('should call onDataRefreshed callback with staleness status', async () => {
        const utils = createPrerenderingChangeHandler(
            detector,
            mockLoadCheckout,
            mockGetCurrentData,
            'checkout-123',
            mockOnDataRefreshed,
        );

        // Set up initial snapshot
        const initialData = {
            getCheckout: jest.fn(() => ({ id: 'checkout-123', version: 1, updatedTime: '2023-01-01T00:00:00Z' })),
        } as any;

        detector.captureInitialSnapshot(initialData);

        await utils();

        expect(mockOnDataRefreshed).toHaveBeenCalledWith(true); // Data is stale (different checkout ID)
    });

    it('should handle loadCheckout errors gracefully', async () => {
        mockLoadCheckout.mockRejectedValue(new Error('Network error'));

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const utils = createPrerenderingChangeHandler(
            detector,
            mockLoadCheckout,
            mockGetCurrentData,
            'checkout-123',
        );

        await utils();

        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to refresh checkout data after prerendering:',
            expect.any(Error),
        );

        consoleSpy.mockRestore();
    });
});

describe('createCheckoutRefreshAPI', () => {
    let detector: PrerenderingStalenessDetector;
    let mockLoadCheckout: jest.Mock;
    let mockGetCurrentData: jest.Mock;
    let api: any;

    beforeEach(() => {
        detector = new PrerenderingStalenessDetector();
        mockLoadCheckout = jest.fn();
        mockGetCurrentData = jest.fn();

        const mockCheckoutData = {
            getCheckout: jest.fn(() => ({ id: 'checkout-123', version: 1, updatedTime: '2023-01-01T00:00:00Z' })),
        } as any;

        mockGetCurrentData.mockReturnValue(mockCheckoutData);

        api = createCheckoutRefreshAPI(
            detector,
            mockLoadCheckout,
            mockGetCurrentData,
            'checkout-123',
        );
    });

    describe('refreshCheckout', () => {
        it('should refresh checkout data and return success status', async () => {
            const result = await api.refreshCheckout();

            expect(mockLoadCheckout).toHaveBeenCalledWith('checkout-123', {
                params: {
                    include: [
                        'cart.lineItems.physicalItems.categoryNames',
                        'cart.lineItems.digitalItems.categoryNames',
                    ],
                },
            });

            expect(result).toEqual({ wasStale: false, success: true });
        });

        it('should force refresh when force=true', async () => {
            const result = await api.refreshCheckout(true);

            expect(result).toEqual({ wasStale: true, success: true });
        });

        it('should handle errors and return failure status', async () => {
            mockLoadCheckout.mockRejectedValue(new Error('Network error'));

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const result = await api.refreshCheckout();

            expect(result).toEqual({ wasStale: false, success: false });
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('isCheckoutStale', () => {
        it('should return detector staleness status', () => {
            // Set up initial snapshot with different checkout ID
            const initialData = {
                getCheckout: jest.fn(() => ({ id: 'checkout-456', version: 1, updatedTime: '2023-01-01T00:00:00Z' })),
            } as any;

            detector.captureInitialSnapshot(initialData);

            // Current data has different checkout ID
            const currentData = {
                getCheckout: jest.fn(() => ({ id: 'checkout-123', version: 1, updatedTime: '2023-01-01T00:00:00Z' })),
            } as any;

            mockGetCurrentData.mockReturnValue(currentData);

            const isStale = api.isCheckoutStale();

            expect(isStale).toBe(true);
        });
    });

    describe('getCurrentSnapshot', () => {
        it('should return current checkout snapshot', () => {
            const snapshot = api.getCurrentSnapshot();

            expect(snapshot).toEqual({
                checkoutId: 'checkout-123',
                version: 1,
                timestamp: expect.any(Number),
            });
        });

        it('should return null when checkout is missing', () => {
            const mockData = {
                getCheckout: jest.fn(() => undefined),
            } as any;

            mockGetCurrentData.mockReturnValue(mockData);

            const snapshot = api.getCurrentSnapshot();

            expect(snapshot).toBeNull();
        });
    });
});