import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import { useCallback, useContext, useSyncExternalStore } from 'react';

import CheckoutContext, { type CheckoutContextProps } from './CheckoutContext';

export function useCheckout<TSelectedState>(
    selectFn?: (state: CheckoutSelectors) => TSelectedState,
): CheckoutContextProps & { selectedState: unknown | undefined } {
    const context = useContext(CheckoutContext);

    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutContextProvider');
    }

    const { checkoutService } = context;

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            const unsubscribe = checkoutService.subscribe(onStoreChange, (state) => {
                if (selectFn && context.isUseCheckoutHookExperimentEnabled) {
                    return selectFn(state);
                }

                return state;
            });

            return unsubscribe;
        },
        [checkoutService, selectFn, context.isUseCheckoutHookExperimentEnabled],
    );

    const snapshot = useSyncExternalStore(subscribe, checkoutService.getState);

    return {
        ...context,
        checkoutState: context.isUseCheckoutHookExperimentEnabled
            ? checkoutService.getState()
            : context.checkoutState,
        selectedState: selectFn ? selectFn(snapshot) : undefined,
    };
}
