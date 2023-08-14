import { ExtensionCommandType } from '@bigcommerce/checkout-sdk';

import { CommandHandler } from './CommandHandler';

export const reloadCheckout: CommandHandler = ({ checkoutService, extension }) => {
    return checkoutService.handleExtensionCommand(
        extension.id,
        ExtensionCommandType.ReloadCheckout,
        () => {
            void checkoutService.loadCheckout(checkoutService.getState().data.getCheckout()?.id);
        },
    );
};
