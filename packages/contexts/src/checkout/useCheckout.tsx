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

    const { checkoutService, checkoutState, isCheckoutHookExperimentEnabled } = context;

    const selectFnRef = useRef(selectFn);

    useEffect(() => {
        selectFnRef.current = selectFn;
    });

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            const unsubscribe = checkoutService.subscribe(onStoreChange, (state) => {
                if (selectFnRef.current && isCheckoutHookExperimentEnabled) {
                    return selectFnRef.current(state);
                }

                return state;
            });

            return unsubscribe;
        },
        [checkoutService, isCheckoutHookExperimentEnabled],
    );

    const stateSnapshot = useSyncExternalStore(subscribe, () => checkoutService.getState());

    return {
        ...context,
        checkoutState: isCheckoutHookExperimentEnabled ? stateSnapshot : checkoutState,
        selectedState: selectFn ? selectFn(stateSnapshot) : undefined,
    };
}
