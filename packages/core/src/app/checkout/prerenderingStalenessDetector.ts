import { type CheckoutSelectors, type CheckoutStoreSelector } from '@bigcommerce/checkout-sdk';

// Extend the Checkout interface to include version field from API response
declare module '@bigcommerce/checkout-sdk' {
    interface Checkout {
        version: number;
    }
}

export interface CheckoutDataSnapshot {
    checkoutId: string;
    version: number;
    timestamp: number;
}

export class PrerenderingStalenessDetector {
    private initialSnapshot: CheckoutDataSnapshot | null = null;

    /**
     * Captures the current checkout data snapshot when the page is first loaded (prerendered)
     */
    captureInitialSnapshot(data: CheckoutStoreSelector): void {
        const checkout = data.getCheckout();

        if (!checkout) {
            return;
        }

        this.initialSnapshot = {
            checkoutId: checkout.id,
            version: checkout.version,
            timestamp: Date.now(),
        };
    }

    /**
     * Compares current checkout data with the initial snapshot to detect staleness
     */
    isDataStale(currentData: CheckoutStoreSelector): boolean {
        if (!this.initialSnapshot) {
            return false;
        }

        const currentCheckout = currentData.getCheckout();

        if (!currentCheckout) {
            return true;
        }

        // Compare checkout ID and version for staleness detection
        // Version ID changes when cart contents, totals, or other checkout data changes
        return this.initialSnapshot.checkoutId !== currentCheckout.id || 
               this.initialSnapshot.version !== currentCheckout.version;
    }

    /**
     * Resets the detector state
     */
    reset(): void {
        this.initialSnapshot = null;
    }

    /**
     * Returns whether the detector has captured an initial snapshot
     */
    hasSnapshot(): boolean {
        return this.initialSnapshot !== null;
    }
}

/**
 * Creates a prerendering change event handler that refreshes checkout data if stale
 */
export function createPrerenderingChangeHandler(
    detector: PrerenderingStalenessDetector,
    loadCheckout: (checkoutId: string, options?: any) => Promise<CheckoutSelectors>,
    getCurrentData: () => CheckoutStoreSelector,
    checkoutId: string,
    onDataRefreshed?: (wasStale: boolean) => void,
): () => Promise<void> {
    return async () => {
        try {
            // Load fresh checkout data
            await loadCheckout(checkoutId, {
                params: {
                    include: [
                        'cart.lineItems.physicalItems.categoryNames',
                        'cart.lineItems.digitalItems.categoryNames',
                    ] as any,
                },
            });

            // Get the current data from the fresh result
            const freshData = getCurrentData();

            // Check if the data is stale compared to the prerendered snapshot
            const wasStale = detector.isDataStale(freshData);
            
            // Call the optional callback to notify about the refresh result
            if (onDataRefreshed) {
                onDataRefreshed(wasStale);
            }

            // If data was stale, the loadCheckout call above will have automatically
            // updated the checkout state, so no additional action is needed
        } catch (error) {
            // Silently fail - if we can't refresh the data, the existing
            // checkout flow will handle any issues when the user proceeds
            // eslint-disable-next-line no-console
            console.warn('Failed to refresh checkout data after prerendering:', error);
        }
    };
}

export interface CheckoutRefreshAPI {
    /**
     * Refreshes the checkout data by polling the API
     * @param force - If true, refreshes regardless of staleness detection
     * @returns Promise that resolves with refresh result
     */
    refreshCheckout(force?: boolean): Promise<{ wasStale: boolean; success: boolean }>;

    /**
     * Checks if the current checkout data is stale without refreshing
     */
    isCheckoutStale(): boolean;

    /**
     * Gets the current checkout data snapshot for comparison
     */
    getCurrentSnapshot(): CheckoutDataSnapshot | null;
}

/**
 * Creates a global checkout refresh API that can be exposed on the window object
 */
export function createCheckoutRefreshAPI(
    detector: PrerenderingStalenessDetector,
    loadCheckout: (checkoutId: string, options?: any) => Promise<CheckoutSelectors>,
    getCurrentData: () => CheckoutStoreSelector,
    checkoutId: string,
): CheckoutRefreshAPI {
    return {
        async refreshCheckout(force = false): Promise<{ wasStale: boolean; success: boolean }> {
            try {
                // Check staleness before refresh if not forced
                const wasStaleBeforeRefresh = force || detector.isDataStale(getCurrentData());

                // Load fresh checkout data
                await loadCheckout(checkoutId, {
                    params: {
                        include: [
                            'cart.lineItems.physicalItems.categoryNames',
                            'cart.lineItems.digitalItems.categoryNames',
                        ] as any,
                    },
                });

                // Get updated data and check final staleness state
                const freshData = getCurrentData();

                detector.isDataStale(freshData); // Check but don't use result since we already have wasStaleBeforeRefresh

                return { wasStale: wasStaleBeforeRefresh, success: true };
            } catch (error) {
                // eslint-disable-next-line no-console
                console.warn('Failed to refresh checkout data:', error);

                return { wasStale: false, success: false };
            }
        },

        isCheckoutStale(): boolean {
            return detector.isDataStale(getCurrentData());
        },

        getCurrentSnapshot(): CheckoutDataSnapshot | null {
            const currentData = getCurrentData();
            const checkout = currentData.getCheckout();

            if (!checkout) {
                return null;
            }

            return {
                checkoutId: checkout.id,
                version: checkout.version,
                timestamp: Date.now(),
            };
        },
    };
}