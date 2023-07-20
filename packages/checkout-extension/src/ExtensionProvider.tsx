import { CheckoutService } from '@bigcommerce/checkout-sdk';
import React, { ReactNode, useState } from 'react';

import { ExtensionService } from './ExtensionService';
import { ExtensionContext } from './ExtensionContext';

export interface ExtensionProviderProps {
    checkoutService: CheckoutService;
    children: ReactNode;
}

export const ExtensionProvider = ({ checkoutService, children }: ExtensionProviderProps) => {
    const [isExtensionEnabled, setIsExtensionEnabled] = useState(false);
    const [isShowingLoadingIndicator, setIsShowingLoadingIndicator] = useState(false);

    const extensionService = new ExtensionService(checkoutService, setIsShowingLoadingIndicator);
    const extensionValues = {
        extensionService,
        isExtensionEnabled,
        isShowingLoadingIndicator,
        setIsExtensionEnabled,
        setIsShowingLoadingIndicator,
    };

    return (
        <ExtensionContext.Provider value={extensionValues}>{children}</ExtensionContext.Provider>
    );
};
