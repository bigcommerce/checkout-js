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

const CheckoutProviderV2 = ({
    checkoutService,
    errorLogger,
    children,
    isUseCheckoutHookExperimentEnabled,
}: CheckoutProviderProps): ReactElement => {
    const checkoutState = checkoutService.getState();
    const contextValue = {
        checkoutService,
        checkoutState, // TODO: this can be removed once experiment is over
        errorLogger,
        isUseCheckoutHookExperimentEnabled,
    };

    return <CheckoutContext.Provider value={contextValue}>{children}</CheckoutContext.Provider>;
};

const CheckoutProviderV1 = ({
    checkoutService,
    errorLogger,
    children,
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
        unsubscribeRef.current = checkoutService.subscribe((newCheckoutState) =>
            setCheckoutState(newCheckoutState),
        );

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = undefined;
            }
        };
    }, [checkoutService]);

    return <CheckoutContext.Provider value={contextValue}>{children}</CheckoutContext.Provider>;
};

const CheckoutProvider = ({
    isUseCheckoutHookExperimentEnabled,
    ...props
}: CheckoutProviderProps): ReactElement => {
    if (isUseCheckoutHookExperimentEnabled) {
        return (
            <CheckoutProviderV2
                isUseCheckoutHookExperimentEnabled={isUseCheckoutHookExperimentEnabled}
                {...props}
            />
        );
    }

    return <CheckoutProviderV1 {...props} />;
};

export default CheckoutProvider;
