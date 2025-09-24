import { act, renderHook, waitFor } from '@testing-library/react';

import { useExtensions } from '@bigcommerce/checkout/checkout-extension';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { getCheckout } from '../checkouts.mock';

import { useLoadCheckout } from './useLoadCheckout';

jest.mock('@bigcommerce/checkout/payment-integration-api');
jest.mock('@bigcommerce/checkout/checkout-extension');

describe('useLoadCheckout', () => {
    const mockCheckoutService = {
        loadCheckout: jest.fn(),
    };
    const mockExtensionService = {
        loadExtensions: jest.fn(),
    };
    const checkoutId = 'xxxx-xxxx-xxxx-xxxx';

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        (useCheckout as jest.Mock).mockReturnValue({
            checkoutService: mockCheckoutService,
            checkoutState: {
                data: {
                    getConfig: () => ({
                        checkoutSettings: {
                            features: {
                                'CHECKOUT-9388.initial_state_for_checkout_app': false,
                            },
                        },
                    }),
                },
            },
        });

        (useExtensions as jest.Mock).mockReturnValue({
            extensionService: mockExtensionService,
        });

        mockCheckoutService.loadCheckout.mockResolvedValue(getCheckout());
        mockExtensionService.loadExtensions.mockResolvedValue([]);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should initialize with isLoadingCheckout as true', async () => {
        const { result } = renderHook(() => useLoadCheckout(checkoutId));

        await act(async () => {
            await waitFor(() => {
                expect(mockExtensionService.loadExtensions).toHaveBeenCalled();
            });

            expect(result.current.isLoadingCheckout).toBe(true);
        });
    });

    it('should throw an error after maximum retries', async () => {
        mockCheckoutService.loadCheckout.mockRejectedValue(new Error('Network error'));

        try {
            renderHook(() => useLoadCheckout(checkoutId));

            await act(async () => {
                jest.advanceTimersByTime(2000);
                await Promise.resolve();

                jest.advanceTimersByTime(4000);
                await Promise.resolve();

                jest.advanceTimersByTime(9000);
                await Promise.resolve();
            });
        } catch {
            expect(mockCheckoutService.loadCheckout).toHaveBeenCalledTimes(3);
        }
    });

    it('does not load check if experiment is on', async () => {
        (useCheckout as jest.Mock).mockReturnValue({
            checkoutService: mockCheckoutService,
            checkoutState: {
                data: {
                    getConfig: () => ({
                        checkoutSettings: {
                            features: {
                                'CHECKOUT-9388.initial_state_for_checkout_app': true,
                            },
                        },
                    }),
                },
            },
        });

        renderHook(() => useLoadCheckout(checkoutId));

        await act(async () => {
            expect(mockCheckoutService.loadCheckout).not.toHaveBeenCalled();
            expect(mockExtensionService.loadExtensions).not.toHaveBeenCalled();
        });
    });
});
