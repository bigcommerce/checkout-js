import { createContext } from 'react';

import { ExtensionState } from './ExtensionProvider';
import { ExtensionService } from './ExtensionService';

export interface ExtensionContextProps {
    extensionService: ExtensionService;
    extensionState: ExtensionState;
}

export const ExtensionContext = createContext<ExtensionContextProps | undefined>(undefined);
