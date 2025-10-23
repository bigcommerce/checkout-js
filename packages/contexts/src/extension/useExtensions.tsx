import { useContext } from 'react';

import { ExtensionContext } from './ExtensionContext';

export const useExtensions = () => {
    const extensionContext = useContext(ExtensionContext);

    if (!extensionContext) {
        throw new Error('useExtensions must be used within an <ExtensionProvider>');
    }

    return extensionContext;
};
