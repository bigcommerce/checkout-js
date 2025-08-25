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

export interface CheckoutProviderProps {
    checkoutService: CheckoutService;
    children: ReactNode;
}

const CheckoutProvider = ({ checkoutService, children }: CheckoutProviderProps): ReactElement => {
    const [checkoutState, setCheckoutState] = useState<CheckoutSelectors>(() =>
        checkoutService.getState(),
    );
    const unsubscribeRef = useRef<(() => void) | undefined>();

    const contextValue = useMemo(
        () => ({
            checkoutService,
            checkoutState,
        }),
        [checkoutService, checkoutState],
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

export default CheckoutProvider;
