import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';

export const ORDER_COMPLETION_RETRY_DELAYS = [500, 1000, 1000, 2000, 2000];

export interface WaitForOrderCompletionOptions {
    initialState: CheckoutSelectors;
    delays?: number[];
    isCancelled(): boolean;
    loadOrder(): Promise<CheckoutSelectors>;
}

const isOrderComplete = ({ data }: CheckoutSelectors): boolean => !!data.getOrder()?.isComplete;

const wait = (ms: number): Promise<void> =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

/**
 * Resolves `true` once the order is complete, `false` if it is not complete within
 * the retry budget, the caller cancels, or a retry fails. Never rejects.
 */
export const waitForOrderCompletion = async ({
    initialState,
    delays = ORDER_COMPLETION_RETRY_DELAYS,
    isCancelled,
    loadOrder,
}: WaitForOrderCompletionOptions): Promise<boolean> => {
    if (isOrderComplete(initialState)) {
        return true;
    }

    for (const delay of delays) {
        // eslint-disable-next-line no-await-in-loop
        await wait(delay);

        if (isCancelled()) {
            return false;
        }

        try {
            // eslint-disable-next-line no-await-in-loop
            const state = await loadOrder();

            if (isCancelled()) {
                return false;
            }

            if (isOrderComplete(state)) {
                return true;
            }
        } catch {
            return false;
        }
    }

    return false;
};
