import { ExtensionCommandType } from '@bigcommerce/checkout-sdk/essential';

import { type CommandHandler, type CommandHandlerProps } from './CommandHandler';

export function createReloadCheckoutHandler({
    checkoutService,
}: CommandHandlerProps): CommandHandler<ExtensionCommandType.ReloadCheckout> {
    return {
        commandType: ExtensionCommandType.ReloadCheckout,
        handler: () => {
            void checkoutService.loadCheckout(checkoutService.getState().data.getCheckout()?.id, {
                params: {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/consistent-type-assertions
                    include: ['consignments.availableShippingOptions'] as any,
                },
            });
        },
    };
}
