import { ExtensionAction, ExtensionActionType, ExtensionState } from './ExtensionProvider';

export const extensionReducer = (
    state: ExtensionState,
    action: ExtensionAction,
): ExtensionState => {
    switch (action.type) {
        case ExtensionActionType.SHOW_LOADING_INDICATOR:
            return { ...state, isShowingLoadingIndicator: action.payload };

        default:
            return state;
    }
};
