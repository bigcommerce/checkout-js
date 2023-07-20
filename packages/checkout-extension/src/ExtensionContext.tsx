import { createContext } from 'react';

import { ExtensionService } from './ExtensionService';

export interface ExtensionContextProps {
    extensionService: ExtensionService;
    isExtensionEnabled: boolean;
    isShowingLoadingIndicator: boolean;
    setIsExtensionEnabled: (isExtensionEnabled: boolean) => void;
    setIsShowingLoadingIndicator: (isShowingLoadingIndicator: boolean) => void;
}

export const ExtensionContext = createContext<ExtensionContextProps | undefined>(undefined);
