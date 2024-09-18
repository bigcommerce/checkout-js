import { ExtensionCommandType } from '@bigcommerce/checkout-sdk';

import { ExtensionActionType } from '../ExtensionProvider';

import { CommandHandler, HandlerProps } from './CommandHandler';

export function createShowLoadingIndicatorHandler({
    dispatch,
}: HandlerProps): CommandHandler<ExtensionCommandType.ShowLoadingIndicator> {
    return {
        commandType: ExtensionCommandType.ShowLoadingIndicator,
        handler: (data) => {
            const { show } = data.payload;

            dispatch({
                type: ExtensionActionType.SHOW_LOADING_INDICATOR,
                payload: show,
            });
        },
    };
}
