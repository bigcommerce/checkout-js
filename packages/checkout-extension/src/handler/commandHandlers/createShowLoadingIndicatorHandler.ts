import { ExtensionCommandType } from '@bigcommerce/checkout-sdk';

import { ExtensionActionType } from '../../ExtensionProvider';

import { CommandHandler, CommandHandlerProps } from './CommandHandler';

export function createShowLoadingIndicatorHandler({
    dispatch,
}: CommandHandlerProps): CommandHandler<ExtensionCommandType.ShowLoadingIndicator> {
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
