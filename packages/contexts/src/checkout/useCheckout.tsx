import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import { useCallback, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

import CheckoutContext, { type CheckoutContextProps } from './CheckoutContext';

export function useCheckout(): CheckoutContextProps & { selectedState: undefined };
export function useCheckout<T>(
    selectFn: (state: CheckoutSelectors) => T,
): CheckoutContextProps & { selectedState: T };
// TODO: Remove this overload when withCheckout HOC is deprecated
export function useCheckout<T>(
    selectFn: ((state: CheckoutSelectors) => T) | undefined,
): CheckoutContextProps & { selectedState: T | undefined };

export function useCheckout<T>(
    selectFn?: (state: CheckoutSelectors) => T,
): CheckoutContextProps & { selectedState: T | undefined } {
    const context = useContext(CheckoutContext);

    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutContextProvider');
    }

    const { checkoutService } = context;

    const selectFnRef = useRef(selectFn);

    useEffect(() => {
        selectFnRef.current = selectFn;
    });

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            const unsubscribe = checkoutService.subscribe(onStoreChange, (state) => {
                if (selectFnRef.current) {
                    return selectFnRef.current(state);
                }

                return state;
            });

            return unsubscribe;
        },
        [checkoutService],
    );

    const stateSnapshot = useSyncExternalStore(subscribe, () => checkoutService.getState());

    return {
        ...context,
        checkoutState: stateSnapshot,
        selectedState: selectFn ? selectFn(stateSnapshot) : undefined,
    };
}
