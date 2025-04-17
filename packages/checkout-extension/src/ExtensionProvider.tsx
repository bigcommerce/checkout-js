import { CheckoutService } from '@bigcommerce/checkout-sdk';
import React, { ReactNode, useReducer } from 'react';

import { ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';

import { ExtensionContext } from './ExtensionContext';
import { extensionReducer } from './ExtensionReducer';
import { ExtensionService } from './ExtensionService';

export interface ExtensionState {
    isShowingLoadingIndicator: boolean;
    shippingFormRenderTimestamp: undefined | number;
}

export interface ExtensionAction {
    type: ExtensionActionType;
    payload: boolean | number;
}

export enum ExtensionActionType {
    SHOW_LOADING_INDICATOR,
    RE_RENDER_SHIPPING_FORM,
}

export interface ExtensionProviderProps {
    checkoutService: CheckoutService;
    children?: ReactNode;
    errorLogger: ErrorLogger;
}

export const ExtensionProvider = ({
    checkoutService,
    children,
    errorLogger,
}: ExtensionProviderProps) => {
    const [extensionState, dispatch] = useReducer(extensionReducer, {
        isShowingLoadingIndicator: false,
        shippingFormRenderTimestamp: undefined,
    });
    const extensionService = new ExtensionService(checkoutService, dispatch, errorLogger);

    const extensionValues = {
        extensionService,
        extensionState,
    };

    return (
        <ExtensionContext.Provider value={extensionValues}>{children}</ExtensionContext.Provider>
    );
};
