import { useEffect, useRef, useSyncExternalStore } from 'react';

import { requestSurcharge } from './requestSurcharge';
import { type SurchargeRequest, type SurchargeResult } from './surchargeContract';
import { ensureSurchargeDevMockInstalled, isSurchargeDevMockEnabled } from './surchargeDevMock';

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
 * Only the backend is mocked (surchargeDevMock.ts). The one thing to change when it exists is
 * `getSurchargeRequester`: today the feature is on only for the dev mock.
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

// ASSUMED: there is no backend endpoint yet, so the feature is on only for the dev mock. When the
// endpoint exists, replace this condition (for example with a flag from the payment method's
// configuration, see the open question about knowing that surcharging is enabled).
export function getSurchargeRequester(): SurchargeRequester | undefined {
    if (!isSurchargeDevMockEnabled()) {
        return undefined;
    }

    ensureSurchargeDevMockInstalled();

    return requestSurcharge;
}

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
    // Called when the backend has answered. In the binding flow the backend has put the surcharge on the
    // checkout (or taken it off), so the app reloads the checkout to show it.
    onResolved?: () => void;
}): void {
    const requestId = useRef(0);
    const onResolvedRef = useRef(onResolved);

    onResolvedRef.current = onResolved;

    useEffect(() => {
        const requester = getSurchargeRequester();

        requestId.current += 1;

        const id = requestId.current;

        if (!requester || !pfToken || !checkoutId || !paymentMethod) {
            publish({ status: 'idle' });

            return;
        }

        publish({ status: 'calculating' });

        requester({ checkoutId, paymentMethod, pfToken })
            .then((result) => {
                if (id !== requestId.current) {
                    return;
                }

                publish(
                    result.eligible && result.amount > 0
                        ? {
                              status: 'ready',
                              amount: result.amount,
                              rate: result.rate,
                              currency: result.currency,
                              legalText: result.legalText,
                          }
                        : { status: 'none' },
                );
                onResolvedRef.current?.();
            })
            .catch(() => {
                if (id === requestId.current) {
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
