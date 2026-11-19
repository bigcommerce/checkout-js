import { noop } from 'lodash';
import { useEffect, useRef, useSyncExternalStore } from 'react';

import { removeSurcharge, requestSurcharge } from './requestSurcharge';
import { type SurchargeRequest, type SurchargeResult } from './surchargeContract';

/**
 * The surcharge shown BEFORE the shopper places the order (the "Calculating..." -> "Surcharge (3.0%)"
 * flow of the prototype). The payment form and the order summary live in different parts of the tree,
 * so the state sits in a tiny module-level store.
 *
 * How it works, as it is meant to work once the backend has the endpoint:
 *   - the card form reports that a card is being entered (hosted fields: card type known);
 *   - the FE sends `{ paymentMethod, pfToken }` (BlueSnap `clientToken`) for the checkout (`requestSurcharge`) and the
 *     backend answers `{ eligible, amount, rate, legalText, ... }` - the FE never calculates anything;
 *   - the answer is shown in the summary and in the total, the order button waits for it.
 *
 */
export type SurchargeState =
    | { status: 'idle' }
    | { status: 'calculating' }
    | {
          status: 'ready';
          amount: number;
          rate?: number;
          legalText?: string;
      }
    | { status: 'none' }
    | { status: 'error' };

export interface SurchargeInput extends SurchargeRequest {
    checkoutId: string;
}

export type SurchargeRequester = (input: SurchargeInput) => Promise<SurchargeResult>;

let current: SurchargeState = { status: 'idle' };
const listeners = new Set<() => void>();

const publish = (next: SurchargeState) => {
    current = next;
    listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
};

// How many card forms show the surcharge notices inside their own box. The payment form shows them
// below the methods only when no card form does, so they never appear twice.
let cardBoxCount = 0;

const changeCardBoxCount = (delta: number) => {
    cardBoxCount += delta;
    listeners.forEach((listener) => listener());
};

export function useRegisterSurchargeCardBox(): void {
    useEffect(() => {
        changeCardBoxCount(1);

        return () => changeCardBoxCount(-1);
    }, []);
}

export function useIsSurchargeCardBoxShown(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => cardBoxCount > 0,
        () => cardBoxCount > 0,
    );
}

export const getSurchargeState = (): SurchargeState => current;

export function useSurchargeState(): SurchargeState {
    return useSyncExternalStore(subscribe, getSurchargeState, getSurchargeState);
}

export function getSurchargeRequester(): SurchargeRequester | undefined {
    return requestSurcharge;
}

// The `providerData` of the last answer. Echoed into the payment request on submit, even when the
// answer was "not eligible".
let providerData: Record<string, unknown> | undefined;

export const getSurchargeProviderData = (): Record<string, unknown> | undefined => providerData;

// Dev aid: say why the surcharge UI is (not) shown for the selected method.
export function logSurchargeMethodDecision(
    method: { id: string; gateway?: string | null; method: string; type: string } | undefined,
    isCardMethod: boolean,
): void {
    if (!isSurchargeEnabled()) {
        return;
    }

    // eslint-disable-next-line no-console
    console.info(
        `%c[surcharge-mock] selected method ${isCardMethod ? 'IS' : 'is NOT'} treated as a card`,
        'color:#b45309',
        method && {
            id: method.id,
            gateway: method.gateway,
            method: method.method,
            type: method.type,
        },
    );
}

export const isSurchargeEnabled = (): boolean => getSurchargeRequester() !== undefined;

/**
 * POST (calculate) when a pfToken is available: bcapp replaces the fee, or removes it when not eligible.
 * DELETE when a `card_surcharge` fee is on the checkout but there is no card to calculate it for
 * (page reload, card cleared, payment method switched away from BlueSnap). Never both at once.
 * A stale answer (the card or the amount changed while a request was in flight) is not shown, but the
 * checkout is still reloaded because bcapp may have changed the fee.
 *
 * `total` is NOT sent: the backend reads the amount from the checkout. It only tells us to ask again,
 * because the surcharge depends on the amount (coupon, shipping, address changes).
 */
export function useSurchargeTrigger({
    pfToken,
    checkoutId,
    paymentMethod,
    total,
    cardType,
    hasFee,
    onResolved,
}: {
    pfToken?: string;
    // The card brand/type. A different card needs a new calculation under the same pfToken.
    cardType?: string;
    // A `card_surcharge` fee is on the checkout right now.
    hasFee: boolean;
    checkoutId?: string;
    paymentMethod?: SurchargeRequest['paymentMethod'];
    total: number;
    // Called when bcapp has answered a POST or a DELETE (it has already changed the fee on the checkout).
    // The app reloads the checkout. The state turns ready (or idle) only after that.
    onResolved?: () => Promise<void>;
}): void {
    const requestId = useRef(0);
    const onResolvedRef = useRef(onResolved);
    // POST and DELETE change the same fee on the server and must never overlap: a late POST would put
    // the fee back after a DELETE (coupon: total change starts a POST, the payment methods reload resets
    // the card form, the lost token starts a DELETE). Every call waits for the one before it, and a call
    // that was superseded while it waited is skipped.
    const queue = useRef<Promise<unknown>>(Promise.resolve());
    const enqueue = <T>(id: number, call: () => Promise<T>): Promise<T | undefined> => {
        const result = queue.current.then(() => (id === requestId.current ? call() : undefined));

        queue.current = result.then(noop, noop);

        return result;
    };

    onResolvedRef.current = onResolved;

    useEffect(() => {
        const requester = getSurchargeRequester();

        requestId.current += 1;

        const id = requestId.current;

        if (!requester || !pfToken || !checkoutId || !paymentMethod) {
            providerData = undefined;
            publish({ status: 'idle' });

            return;
        }

        publish({ status: 'calculating' });

        enqueue(id, () => requester({ checkoutId, paymentMethod, pfToken }))
            .then(async (result) => {
                if (!result) {
                    // Skipped: superseded before it was sent. Nothing changed on the server.
                    return;
                }

                if (id !== requestId.current) {
                    // Superseded, but bcapp may have changed the fee: reload so the FE sees it.
                    void onResolvedRef.current?.();

                    return;
                }

                providerData = result.providerData;
                await onResolvedRef.current?.();

                if (id !== requestId.current) {
                    return;
                }

                publish(
                    result.eligible && result.amount > 0
                        ? {
                              status: 'ready',
                              amount: result.amount,
                              rate: result.rate,
                          }
                        : { status: 'none' },
                );
            })
            .catch(() => {
                if (id === requestId.current) {
                    providerData = undefined;
                    publish({ status: 'error' });
                }
            });
    }, [pfToken, cardType, checkoutId, paymentMethod?.id, paymentMethod?.gateway, total]);

    // DELETE: a surcharge fee without a card. Runs once per (fee present, no card) change, so a failed
    // DELETE does not loop. While it runs the state is `calculating` (Place order disabled); on failure
    // the state is `error` and the form keeps Place order disabled because the fee is still there.
    const shouldRemoveFee = hasFee && !pfToken && Boolean(checkoutId);

    useEffect(() => {
        if (!shouldRemoveFee || !checkoutId) {
            return;
        }

        requestId.current += 1;

        const id = requestId.current;

        providerData = undefined;
        publish({ status: 'calculating' });

        enqueue(id, async () => {
            await removeSurcharge({ checkoutId });

            return true;
        })
            .then(async (result) => {
                if (!result) {
                    return;
                }

                await onResolvedRef.current?.();

                if (id === requestId.current) {
                    publish({ status: 'idle' });
                }
            })
            .catch(() => {
                if (id === requestId.current) {
                    publish({ status: 'error' });
                }
            });
    }, [shouldRemoveFee, checkoutId]);

    // Leaving the payment step must not leave a preview behind in the summary.
    useEffect(
        () => () => {
            requestId.current += 1;
            publish({ status: 'idle' });
        },
        [],
    );
}
