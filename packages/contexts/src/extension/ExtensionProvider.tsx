import React, { type ReactNode, useReducer } from 'react';

import { ExtensionContext } from './ExtensionContext';
import { extensionReducer } from './ExtensionReducer';
import { type ExtensionServiceInterface } from './ExtensionType';

export interface ExtensionProviderProps {
    extensionService: ExtensionServiceInterface;
    children?: ReactNode;
}

export const ExtensionProvider = ({ children, extensionService }: ExtensionProviderProps) => {
    const [extensionState, dispatch] = useReducer(extensionReducer, {
        isShowingLoadingIndicator: false,
        shippingFormRenderTimestamp: undefined,
    });

    extensionService.setDispatch(dispatch);

    const extensionValues = {
        extensionService,
        extensionState,
    };

    return (
        <ExtensionContext.Provider value={extensionValues}>{children}</ExtensionContext.Provider>
    );
};
