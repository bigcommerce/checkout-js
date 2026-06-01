import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import { useCallback, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

import CheckoutContext, { type CheckoutContextProps } from './CheckoutContext';

// TODO: Remove TypeScript function overloads once CheckoutProviderV2 is fully rolled out
export function useCheckout<T>(
    selectFn: (state: CheckoutSelectors) => T,
): CheckoutContextProps & { selectedState: T };
export function useCheckout(
    selectFn?: undefined,
): CheckoutContextProps & { selectedState: undefined };

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
