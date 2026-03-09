import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import React, { type ReactElement, type ReactNode, useMemo } from 'react';

import { defaultCapabilities } from './Capability';
import CapabilitiesContext from './CapabilitiesContext';

interface CapabilitiesProviderProps {
    checkoutState: CheckoutSelectors;
    children: ReactNode;
}

const CapabilitiesProvider = ({
    checkoutState,
    children,
}: CapabilitiesProviderProps): ReactElement => {
    const capabilities =
        checkoutState.data.getConfig()?.checkoutSettings.capabilities ?? defaultCapabilities;

    const contextValue = useMemo(() => ({ capabilities }), [capabilities]);

    return (
        <CapabilitiesContext.Provider value={contextValue}>{children}</CapabilitiesContext.Provider>
    );
};

export default CapabilitiesProvider;
