import { type CheckoutSelectors, type CheckoutService } from '@bigcommerce/checkout-sdk';
import { createContext, useContext, useRef, useSyncExternalStore } from 'react';

import type ErrorLogger from './ErrorLogger';

export interface CheckoutContextV2Props {
    checkoutService: CheckoutService;
    checkoutState: CheckoutSelectors;
    errorLogger?: ErrorLogger;
    isUseCheckoutHookExperimentEnabled?: boolean;
}

export const CheckoutContextV2 = createContext<CheckoutContextV2Props | undefined>(undefined);

export function useCheckoutV2<TSelectedState>(
    selectFn?: (state: CheckoutSelectors) => TSelectedState,
): CheckoutContextV2Props & { selectedState: unknown | undefined } {
    const context = useContext(CheckoutContextV2);

    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutContextProvider');
    }

    const { checkoutService, isUseCheckoutHookExperimentEnabled } = context;
    const value = useRef<TSelectedState>();

    const selectedState = useSyncExternalStore(
        (onStoreChange: () => void) => {
            return checkoutService.subscribe(onStoreChange, (state) => {
                if (selectFn && isUseCheckoutHookExperimentEnabled) {
                    value.current = selectFn(state);

                    return value.current;
                }

                return state;
            });
        },
        () => {
            return selectFn && isUseCheckoutHookExperimentEnabled
                ? value.current
                : checkoutService.getState();
        },
    );

    return {
        ...context,
        checkoutState: checkoutService.getState(),
        selectedState,
    };
}
