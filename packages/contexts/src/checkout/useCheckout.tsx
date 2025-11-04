import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import { useContext, useRef, useSyncExternalStore } from 'react';

import CheckoutContext from './CheckoutContext';
import { CheckoutContextV2, type CheckoutContextV2Props } from './CheckoutContextV2';

export function useCheckout<TSelectedState>(
    selectFn?: (state: CheckoutSelectors) => TSelectedState,
): CheckoutContextV2Props & { selectedState: unknown | undefined } {
    const contextV2 = useContext(CheckoutContextV2);
    const contextV1 = useContext(CheckoutContext);

    const isUseCheckoutHookExperimentEnabled = contextV2?.isUseCheckoutHookExperimentEnabled;
    const context = isUseCheckoutHookExperimentEnabled ? contextV2 : contextV1;

    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutContextProvider');
    }

    const { checkoutService } = context;
    const value = useRef<TSelectedState | undefined>(
        selectFn ? selectFn(checkoutService.getState()) : undefined,
    );

    const selectedState = useSyncExternalStore(
        (onStoreChange: () => void) => {
            const unsubscribe = checkoutService.subscribe(onStoreChange, (state) => {
                if (selectFn && isUseCheckoutHookExperimentEnabled) {
                    value.current = selectFn(state);

                    return value.current;
                }

                return state;
            });

            return unsubscribe;
        },
        () => {
            return selectFn && isUseCheckoutHookExperimentEnabled
                ? value.current
                : checkoutService.getState();
        },
    );

    return {
        ...context,
        checkoutState: isUseCheckoutHookExperimentEnabled
            ? checkoutService.getState()
            : context.checkoutState,
        selectedState,
    };
}
