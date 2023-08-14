import { ExtensionCommandType } from '@bigcommerce/checkout-sdk';

import { ExtensionActionType } from '../ExtensionProvider';

import { CommandHandler } from './CommandHandler';

export const showLoadingIndicator: CommandHandler = ({ checkoutService, dispatch, extension }) => {
    return checkoutService.handleExtensionCommand(
        extension.id,
        ExtensionCommandType.ShowLoadingIndicator,
        (data) => {
            const { show } = data.payload;

            dispatch({
                type: ExtensionActionType.SHOW_LOADING_INDICATOR,
                payload: show,
            });
        },
    );
};
