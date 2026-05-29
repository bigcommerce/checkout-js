import React, { type FC, type PropsWithChildren } from 'react';

import { useCheckout } from '../checkout/useCheckout';

import CapabilitiesContext from './CapabilitiesContext';
import { defaultCapabilities } from './Capability';

export const CapabilitiesProviderV2: FC<PropsWithChildren> = ({ children }) => {
    const { selectedState: config } = useCheckout((state) => state.data.getConfig());

    const capabilities = config?.checkoutSettings.capabilities ?? defaultCapabilities;

    return (
        <CapabilitiesContext.Provider value={capabilities}>{children}</CapabilitiesContext.Provider>
    );
};
