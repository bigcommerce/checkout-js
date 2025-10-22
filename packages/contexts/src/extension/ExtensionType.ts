import type { ExtensionRegion } from '@bigcommerce/checkout-sdk';

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

export interface ExtensionServiceInterface {
    setDispatch(dispatch: React.Dispatch<ExtensionAction>): void;
    loadExtensions(): Promise<void>;
    preloadExtensions(): void;
    renderExtension(container: string, region: ExtensionRegion): Promise<void>;
    removeListeners(region: ExtensionRegion): void;
    isRegionEnabled(region: ExtensionRegion): boolean;
}
