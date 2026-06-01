import { type CheckoutSelectors, type CheckoutService } from '@bigcommerce/checkout-sdk';
import React, {
    type ReactElement,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { CapabilitiesProvider, CapabilitiesProviderV2 } from '../capabilities';

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
    const contextValue = useMemo(
        () => ({
            checkoutService,
            checkoutState: checkoutService.getState(), // TODO: this can be removed once experiment is over
            errorLogger,
            isCheckoutHookExperimentEnabled,
        }),
        [checkoutService, errorLogger, isCheckoutHookExperimentEnabled],
    );

    return (
        <CheckoutContext.Provider value={contextValue}>
            <CapabilitiesProviderV2>{children}</CapabilitiesProviderV2>
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
