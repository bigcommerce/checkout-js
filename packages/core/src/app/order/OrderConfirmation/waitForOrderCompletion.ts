import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';

export const ORDER_COMPLETION_MAX_RETRIES = 5;
export const ORDER_COMPLETION_RETRY_DELAY_MS = 1000;

export interface WaitForOrderCompletionOptions {
    initialState: CheckoutSelectors;
    orderId: number;
    isCancelled(): boolean;
    loadOrder(orderId: number): Promise<CheckoutSelectors>;
}

const wait = (ms: number): Promise<void> =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

/**
 * Some payment providers finalize orders asynchronously, so the order can still
 * be incomplete when the confirmation page first loads. Reloads the order until
 * it is complete or the retry budget runs out. Never throws: a failed reload
 * resolves to `false`.
 */
export async function waitForOrderCompletion(
    { initialState, orderId, isCancelled, loadOrder }: WaitForOrderCompletionOptions,
    retriesLeft = ORDER_COMPLETION_MAX_RETRIES,
): Promise<boolean> {
    if (initialState.data.getOrder()?.isComplete) {
        return true;
    }

    if (retriesLeft <= 0 || isCancelled()) {
        return false;
    }

    await wait(ORDER_COMPLETION_RETRY_DELAY_MS);

    if (isCancelled()) {
        return false;
    }

    try {
        const state = await loadOrder(orderId);

        return await waitForOrderCompletion(
            { initialState: state, orderId, isCancelled, loadOrder },
            retriesLeft - 1,
        );
    } catch {
        return false;
    }
}
