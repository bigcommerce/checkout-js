import { type CheckoutService } from '@bigcommerce/checkout-sdk';
import React, { type ReactNode, useMemo } from 'react';

import { CapabilitiesProviderV2 } from '../capabilities';

import CheckoutContext from './CheckoutContext';
import type ErrorLogger from './ErrorLogger';

export interface CheckoutProviderProps {
    checkoutService: CheckoutService;
    children: ReactNode;
    errorLogger?: ErrorLogger;
}

const CheckoutProviderV2: React.FC<CheckoutProviderProps> = ({
    checkoutService,
    errorLogger,
    children,
}) => {
    const contextValue = useMemo(
        () => ({
            checkoutService,
            checkoutState: checkoutService.getState(), // TODO: this can be removed once experiment is over
            errorLogger,
        }),
        [checkoutService, errorLogger],
    );

    return (
        <CheckoutContext.Provider value={contextValue}>
            <CapabilitiesProviderV2>{children}</CapabilitiesProviderV2>
        </CheckoutContext.Provider>
    );
};

const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ ...props }) => {
    return <CheckoutProviderV2 {...props} />;
};

export default CheckoutProvider;
