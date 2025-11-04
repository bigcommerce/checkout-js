import { type CheckoutSelectors, type CheckoutService } from '@bigcommerce/checkout-sdk';
import React, {
    type ReactElement,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import CheckoutContext from './CheckoutContext';
import type ErrorLogger from './ErrorLogger';

export interface CheckoutProviderProps {
    checkoutService: CheckoutService;
    children: ReactNode;
    errorLogger?: ErrorLogger;
    isUseCheckoutHookExperimentEnabled?: boolean;
}

const CheckoutProvider = ({
    checkoutService,
    errorLogger,
    children,
    isUseCheckoutHookExperimentEnabled,
}: CheckoutProviderProps): ReactElement => {
    const [checkoutState, setCheckoutState] = useState<CheckoutSelectors>(() =>
        checkoutService.getState(),
    );
    const unsubscribeRef = useRef<(() => void) | undefined>();

    const contextValue = useMemo(
        () => ({
            checkoutService,
            checkoutState,
            errorLogger,
        }),
        [checkoutService, checkoutState, errorLogger],
    );

    useEffect(() => {
        if (isUseCheckoutHookExperimentEnabled) {
            return;
        }

        unsubscribeRef.current = checkoutService.subscribe((newCheckoutState) =>
            setCheckoutState(newCheckoutState),
        );

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = undefined;
            }
        };
    }, [checkoutService, isUseCheckoutHookExperimentEnabled]);

    return <CheckoutContext.Provider value={contextValue}>{children}</CheckoutContext.Provider>;
};

export default CheckoutProvider;
