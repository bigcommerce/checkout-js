import {
    type ExtensionAction,
    ExtensionActionType,
    type ExtensionState,
} from './ExtensionProvider';

export const extensionReducer = (
    state: ExtensionState,
    action: ExtensionAction,
): ExtensionState => {
    switch (action.type) {
        case ExtensionActionType.SHOW_LOADING_INDICATOR:
            if (typeof action.payload === 'boolean') {
                return { ...state, isShowingLoadingIndicator: action.payload };
            }

            break;

        case ExtensionActionType.RE_RENDER_SHIPPING_FORM:
            if (typeof action.payload === 'number') {
                return { ...state, shippingFormRenderTimestamp: action.payload };
            }

            break;

        default:
            return state;
    }

    return state;
};
