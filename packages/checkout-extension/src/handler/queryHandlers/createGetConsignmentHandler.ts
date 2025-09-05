import { ExtensionMessageType, ExtensionQueryType } from '@bigcommerce/checkout-sdk/essential';

import { type QueryHandler, type QueryHandlerProps } from './QueryHandler';

export function createGetConsignmentHandler({
    checkoutService,
    extension,
}: QueryHandlerProps): QueryHandler<ExtensionQueryType.GetConsignments> {
    return {
        queryType: ExtensionQueryType.GetConsignments,
        handler: async (data) => {
            if (!data.payload?.useCache) {
                await checkoutService.loadCheckout();
            }

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
