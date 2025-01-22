import { ExtensionCommandType, ExtensionMessageType } from '@bigcommerce/checkout-sdk';

import { CommandHandler, HandlerProps } from './CommandHandler';

export function createGetConsignmentHandler({
    checkoutService,
    extension,
}: HandlerProps): CommandHandler<ExtensionCommandType.GetConsignments> {
    return {
        commandType: ExtensionCommandType.GetConsignments,
        handler: () => {
            const consignments = checkoutService.getState().data.getCheckout()?.consignments || [];

            checkoutService.postMessageToExtension(extension.id, {
                type: ExtensionMessageType.GetConsignments,
                payload: {
                    consignments,
                },
            });
        },
    };
}
