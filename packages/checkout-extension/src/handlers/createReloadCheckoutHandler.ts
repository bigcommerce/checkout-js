import { ExtensionCommandType } from '@bigcommerce/checkout-sdk';

import { CommandHandler, HandlerProps } from './CommandHandler';

export function createReloadCheckoutHandler({
    checkoutService,
}: HandlerProps): CommandHandler<ExtensionCommandType.ReloadCheckout> {
    return {
        commandType: ExtensionCommandType.ReloadCheckout,
        handler: () => {
            void checkoutService.loadCheckout(checkoutService.getState().data.getCheckout()?.id);
        },
    };
}
