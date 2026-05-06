import { type CheckoutSelectors, type CheckoutService } from '@bigcommerce/checkout-sdk';
import React, {
    type ReactElement,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { flushSync } from 'react-dom';

import { CapabilitiesProvider } from '../capabilities';
import CheckoutContext from './CheckoutContext';
import type ErrorLogger from './ErrorLogger';

export interface CheckoutProviderProps {
    checkoutService: CheckoutService;
    children: ReactNode;
    errorLogger?: ErrorLogger;
    isCheckoutHookExperimentEnabled?: boolean;
}

const CheckoutProviderV2: React.FC<CheckoutProviderProps> = ({
    checkoutService,
    errorLogger,
    children,
    isCheckoutHookExperimentEnabled,
}) => {
    const [checkoutState, setCheckoutState] = useState<CheckoutSelectors>(() =>
        checkoutService.getState(),
    );
    const unsubscribeRef = useRef<(() => void) | undefined>();

    useEffect(() => {
        // flushSync ensures checkout service state updates are applied synchronously,
        // so stepsRef.current in CheckoutPage is up-to-date before any async
        // continuation (e.g. onContinueAsGuest) reads from it. Without this, React 18
        // Concurrent Mode batches the setState and defers the re-render, causing
        // navigateToNextIncompleteStep to read stale step statuses and navigate to the
        // wrong step (Customer instead of Shipping) after guest checkout.
        unsubscribeRef.current = checkoutService.subscribe((newCheckoutState) =>
            flushSync(() => setCheckoutState(newCheckoutState)),
        );

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = undefined;
            }
        };
    }, [checkoutService]);

    const contextValue = useMemo(
        () => ({
            checkoutService,
            checkoutState, // TODO: this can be removed once experiment is over
            errorLogger,
            isCheckoutHookExperimentEnabled,
        }),
        [checkoutService, checkoutState, errorLogger, isCheckoutHookExperimentEnabled],
    );

    return (
        <CheckoutContext.Provider value={contextValue}>
            <CapabilitiesProvider checkoutState={checkoutState}>{children}</CapabilitiesProvider>
        </CheckoutContext.Provider>
    );
};

const CheckoutProviderV1: React.FC<CheckoutProviderProps> = ({
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
        // See comment in CheckoutProviderV2 for why flushSync is needed here.
        unsubscribeRef.current = checkoutService.subscribe((newCheckoutState) =>
            flushSync(() => setCheckoutState(newCheckoutState)),
        );

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = undefined;
            }
        };
    }, [checkoutService]);

    return (
        <CheckoutContext.Provider value={contextValue}>
            <CapabilitiesProvider checkoutState={checkoutState}>{children}</CapabilitiesProvider>
        </CheckoutContext.Provider>
    );
};

const CheckoutProvider: React.FC<CheckoutProviderProps> = ({
    isCheckoutHookExperimentEnabled,
    ...props
}) => {
    if (isCheckoutHookExperimentEnabled) {
        return (
            <CheckoutProviderV2
                isCheckoutHookExperimentEnabled={isCheckoutHookExperimentEnabled}
                {...props}
            />
        );
    }

    return <CheckoutProviderV1 {...props} />;
};

export default CheckoutProvider;
