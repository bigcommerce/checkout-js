import { CheckoutService } from '@bigcommerce/checkout-sdk';
import React, { ReactNode, useReducer } from 'react';

import { ExtensionContext } from './ExtensionContext';
import { ExtensionService } from './ExtensionService';

export interface ExtensionState {
    isExtensionEnabled: boolean;
    isShowingLoadingIndicator: boolean;
}

export interface ExtensionAction {
    type: ExtensionActionType;
    payload: boolean;
}

export enum ExtensionActionType {
    SET_IS_EXTENSION_ENABLED,
    SET_IS_LOADING_INDICATOR,
}

export interface ExtensionProviderProps {
    checkoutService: CheckoutService;
    children: ReactNode;
}

export const ExtensionProvider = ({ checkoutService, children }: ExtensionProviderProps) => {
    const initialState = {
        isExtensionEnabled: false,
        isShowingLoadingIndicator: false,
    };

    const extensionReducer = (state: ExtensionState, action: ExtensionAction): ExtensionState => {
        switch (action.type) {
            case ExtensionActionType.SET_IS_EXTENSION_ENABLED:
                return { ...state, isExtensionEnabled: action.payload };

            case ExtensionActionType.SET_IS_LOADING_INDICATOR:
                return { ...state, isShowingLoadingIndicator: action.payload };

            default:
                return state;
        }
    };

    const [extensionState, dispatch] = useReducer(extensionReducer, initialState);

    const extensionService = new ExtensionService(checkoutService, dispatch);

    const extensionValues = {
        extensionService,
        extensionState,
    };

    return (
        <ExtensionContext.Provider value={extensionValues}>{children}</ExtensionContext.Provider>
    );
};
