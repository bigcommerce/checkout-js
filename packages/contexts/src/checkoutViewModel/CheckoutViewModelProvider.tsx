import type { CheckoutSelectors, CheckoutService } from '@bigcommerce/checkout-sdk';
import React, {
    type ReactElement,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import CheckoutViewModelContext from './CheckoutViewModelContext';
import { CheckoutViewModelType } from './CheckoutViewModelType';
import { createB2BCheckoutViewModel } from './createB2BCheckoutViewModel';
import { createB2CCheckoutViewModel } from './createB2CCheckoutViewModel';

export interface CheckoutViewModelProps {
    checkoutService: CheckoutService;
    children: ReactNode;
    type: CheckoutViewModelType;
}

// helper method to improve performance by limiting re-renders to only when addresses change
function getViewModelDependencySignature(checkoutState: CheckoutSelectors): string {
    const addresses = checkoutState.data.getCustomer()?.addresses ?? [];

    return JSON.stringify(addresses);
}

const CheckoutViewModelProvider = ({
    checkoutService,
    children,
    type,
}: CheckoutViewModelProps): ReactElement => {
    const [checkoutState, setCheckoutState] = useState<CheckoutSelectors>(() =>
        checkoutService.getState(),
    );
    const unsubscribeRef = useRef<(() => void) | undefined>();
    const lastSignatureRef = useRef<string>(
        getViewModelDependencySignature(checkoutService.getState()),
    );

    useEffect(() => {
        unsubscribeRef.current = checkoutService.subscribe((newCheckoutState) => {
            const newSignature = getViewModelDependencySignature(newCheckoutState);

            if (newSignature !== lastSignatureRef.current) {
                lastSignatureRef.current = newSignature;
                setCheckoutState(newCheckoutState);
            }
        });

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = undefined;
            }
        };
    }, [checkoutService]);

    const contextValue = useMemo(
        () =>
            type === CheckoutViewModelType.B2B
                ? createB2BCheckoutViewModel(checkoutState)
                : createB2CCheckoutViewModel(checkoutState),
        [checkoutState, type],
    );

    return (
        <CheckoutViewModelContext.Provider value={contextValue}>
            {children}
        </CheckoutViewModelContext.Provider>
    );
};

export default CheckoutViewModelProvider;
