import { createContext } from 'react';

import { type ExtensionState } from './ExtensionProvider';
import { type ExtensionService } from './ExtensionService';

export interface ExtensionContextProps {
    extensionService: ExtensionService;
    extensionState: ExtensionState;
}

export const ExtensionContext = createContext<ExtensionContextProps | undefined>(undefined);
