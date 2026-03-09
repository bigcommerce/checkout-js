import { type Capabilities } from '@bigcommerce/checkout-sdk/essential';
import { createContext, useContext } from 'react';

export type CapabilitiesContextProps = Capabilities;

const CapabilitiesContext = createContext<CapabilitiesContextProps | undefined>(undefined);

export function useCapabilities() {
    const context = useContext(CapabilitiesContext);

    if (!context) {
        throw new Error('useCapabilities must be used within a CapabilitiesProvider');
    }

    return context;
}

export default CapabilitiesContext;
