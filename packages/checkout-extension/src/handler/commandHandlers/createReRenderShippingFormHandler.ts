import { ExtensionCommandType } from '@bigcommerce/checkout-sdk/essential';

import { ExtensionActionType } from '../../ExtensionProvider';

import { type CommandHandler, type CommandHandlerProps } from './CommandHandler';

export function createReRenderShippingFormHandler({
    checkoutService,
    dispatch,
}: CommandHandlerProps): CommandHandler<ExtensionCommandType.ReRenderShippingForm> {
    return {
        commandType: ExtensionCommandType.ReRenderShippingForm,
        handler: async () => {
            await checkoutService.loadCheckout(checkoutService.getState().data.getCheckout()?.id, {
                params: {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/consistent-type-assertions
                    include: ['consignments.availableShippingOptions'] as any,
                },
            });

            dispatch({
                type: ExtensionActionType.RE_RENDER_SHIPPING_FORM,
                payload: Date.now(),
            });
        },
    };
}
