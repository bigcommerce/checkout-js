import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import React, { type ReactElement, type ReactNode } from 'react';

import CapabilitiesContext from './CapabilitiesContext';
import { defaultCapabilities } from './Capability';

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

    return (
        <CapabilitiesContext.Provider value={capabilities}>{children}</CapabilitiesContext.Provider>
    );
};

export default CapabilitiesProvider;
