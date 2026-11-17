import { useEffect, useRef, useSyncExternalStore } from 'react';

import { requestSurcharge } from './requestSurcharge';
import { type SurchargeRequest } from './surchargeContract';
import { ensureSurchargeDevMockInstalled, isSurchargeDevMockEnabled } from './surchargeDevMock';

/**
 * The surcharge shown BEFORE the shopper places the order ("Calculating..." -> "Surcharge (3.0%)").
 * The payment form and the order summary live in different parts of the tree, so the state sits in
 * a tiny module-level store.
 *
 * The FE sends `{ paymentMethod, pfToken }` and the backend answers; the FE never calculates anything.
 * Only the backend is mocked (surchargeDevMock.ts).
 */
export type SurchargeState =
    | { status: 'idle' }
    | { status: 'calculating' }
    | {
          status: 'ready';
          amount: number;
          rate?: number;
          currency?: string;
          legalText?: string;
      }
    | { status: 'none' }
    | { status: 'error' };

let current: SurchargeState = { status: 'idle' };
// How many card forms show the surcharge notices inside their own box. The payment form shows them
// below the methods only when no card form does, so they never appear twice.
let cardBoxCount = 0;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const publish = (next: SurchargeState) => {
    current = next;
    notify();
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
};

const getSurchargeState = (): SurchargeState => current;

export const useSurchargeState = (): SurchargeState =>
    useSyncExternalStore(subscribe, getSurchargeState, getSurchargeState);

export function useRegisterSurchargeCardBox(): void {
    useEffect(() => {
        cardBoxCount += 1;
        notify();

        return () => {
            cardBoxCount -= 1;
            notify();
        };
    }, []);
}

export const useIsSurchargeCardBoxShown = (): boolean => {
    const getSnapshot = () => cardBoxCount > 0;

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

// ASSUMED: there is no backend endpoint yet, so the feature is on only for the dev mock. When the
// endpoint exists, replace this condition (e.g. with a flag from the payment method's configuration).
export function isSurchargeEnabled(): boolean {
    const enabled = isSurchargeDevMockEnabled();

    if (enabled) {
        ensureSurchargeDevMockInstalled();
    }

    return enabled;
}

/**
 * Asks the backend for the surcharge whenever a pfToken is available and clears it otherwise. A stale
 * answer (the card or the amount changed while a request was in flight) is dropped.
 *
 * `total` is NOT sent: the backend reads the amount from the checkout. It only tells us to ask again,
 * because the surcharge depends on the amount (coupon, shipping, address changes).
 */
export function useSurchargeTrigger({
    pfToken,
    checkoutId,
    paymentMethod,
    total,
    onResolved,
}: {
    pfToken?: string;
    checkoutId?: string;
    paymentMethod?: SurchargeRequest['paymentMethod'];
    total: number;
    // Called when the backend has answered: it has put the surcharge on the checkout (or taken it
    // off), so the app reloads the checkout to show it.
    onResolved?: () => void;
}): void {
    const requestId = useRef(0);
    const onResolvedRef = useRef(onResolved);

    onResolvedRef.current = onResolved;

    useEffect(() => {
        requestId.current += 1;

        const id = requestId.current;
        const isStale = () => id !== requestId.current;

        if (!isSurchargeEnabled() || !pfToken || !checkoutId || !paymentMethod) {
            publish({ status: 'idle' });

            return;
        }

        publish({ status: 'calculating' });

        requestSurcharge({ checkoutId, paymentMethod, pfToken })
            .then(({ eligible, amount, rate, currency, legalText }) => {
                if (isStale()) {
                    return;
                }

                publish(
                    eligible && amount > 0
                        ? { status: 'ready', amount, rate, currency, legalText }
                        : { status: 'none' },
                );
                onResolvedRef.current?.();
            })
            .catch(() => {
                if (!isStale()) {
                    publish({ status: 'error' });
                }
            });
    }, [pfToken, checkoutId, paymentMethod?.id, paymentMethod?.gateway, total]);

    // Leaving the payment step must not leave a preview behind in the summary.
    useEffect(
        () => () => {
            requestId.current += 1;
            publish({ status: 'idle' });
        },
        [],
    );
}
