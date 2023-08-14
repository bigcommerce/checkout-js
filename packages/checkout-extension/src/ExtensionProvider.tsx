import { CheckoutService } from '@bigcommerce/checkout-sdk';
import React, { ReactNode, useReducer } from 'react';

import { ExtensionContext } from './ExtensionContext';
import { extensionReducer } from './ExtensionReducer';
import { ExtensionService } from './ExtensionService';
import { isCheckoutExtensionEnabled } from './isCheckoutExtensionEnabled';

export interface ExtensionState {
    isShowingLoadingIndicator: boolean;
}

export interface ExtensionAction {
    type: ExtensionActionType;
    payload: boolean;
}

export enum ExtensionActionType {
    SHOW_LOADING_INDICATOR,
}

export interface ExtensionProviderProps {
    checkoutService: CheckoutService;
    children: ReactNode;
}

export const ExtensionProvider = ({ checkoutService, children }: ExtensionProviderProps) => {
    const isExtensionEnabled = () =>
        isCheckoutExtensionEnabled(checkoutService.getState().data.getConfig()?.checkoutSettings);
    const [extensionState, dispatch] = useReducer(extensionReducer, {
        isShowingLoadingIndicator: false,
    });
    const extensionService = new ExtensionService(checkoutService, dispatch);

    const extensionValues = {
        isExtensionEnabled,
        extensionService,
        extensionState,
    };

    return (
        <ExtensionContext.Provider value={extensionValues}>{children}</ExtensionContext.Provider>
    );
};
