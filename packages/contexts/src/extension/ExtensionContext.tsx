import { createContext } from 'react';

import { type ExtensionServiceInterface, type ExtensionState } from './ExtensionType';

export interface ExtensionContextProps {
    extensionService: ExtensionServiceInterface;
    extensionState: ExtensionState;
}

export const ExtensionContext = createContext<ExtensionContextProps | undefined>(undefined);
