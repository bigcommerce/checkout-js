import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import React, { type ReactElement, type ReactNode, useMemo } from 'react';

import CapabilitiesContext from './CapabilitiesContext';
import { applyCapabilitiesOverride } from './capabilitiesOverride';
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

    // TODO: CHECKOUT-9979: Remove the override logic
    const overriddenCapabilities = useMemo(
        () => applyCapabilitiesOverride(capabilities),
        [capabilities],
    );

    return (
        <CapabilitiesContext.Provider value={overriddenCapabilities}>
            {children}
        </CapabilitiesContext.Provider>
    );
};

export default CapabilitiesProvider;
