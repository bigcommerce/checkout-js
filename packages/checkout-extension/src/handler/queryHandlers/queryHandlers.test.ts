import {
    type Checkout,
    type CheckoutService,
    type Consignment,
    createCheckoutService,
    ExtensionMessageType,
    ExtensionQueryType,
} from '@bigcommerce/checkout-sdk';

import { getExtensions } from '../../index';

import { createGetConsignmentHandler } from './createGetConsignmentHandler';
import { type QueryHandlerProps } from './QueryHandler';

describe('queryHandlers', () => {
    let handlerProps: QueryHandlerProps;
    let checkoutService: CheckoutService;

    const dispatch = jest.fn();

    beforeEach(() => {
        checkoutService = createCheckoutService();
        handlerProps = {
            checkoutService,
            dispatch,
            extension: getExtensions()[0],
        };

        jest.spyOn(checkoutService, 'postMessageToExtension').mockImplementation(jest.fn());
    });

    describe('createGetConsignmentHandler', () => {
        it('posts consignments[] in cache to an extension', () => {
            const handler = createGetConsignmentHandler(handlerProps);
            const consignments: Consignment[] = [];

            jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue({
                consignments,
            } as Checkout);

            void handler.handler({
                type: ExtensionQueryType.GetConsignments,
                payload: {
                    useCache: true,
                },
            });

            expect(checkoutService.postMessageToExtension).toHaveBeenCalledWith(
                getExtensions()[0].id,
                {
                    type: ExtensionMessageType.GetConsignments,
                    payload: {
                        consignments,
                    },
                },
            );
        });

        it('reloads checkout if useCache is false', () => {
            const handler = createGetConsignmentHandler(handlerProps);

            jest.spyOn(checkoutService, 'loadCheckout').mockResolvedValue(
                checkoutService.getState(),
            );

            void handler.handler({
                type: ExtensionQueryType.GetConsignments,
                payload: {
                    useCache: false,
                },
            });

            expect(checkoutService.loadCheckout).toHaveBeenCalled();
        });
    });
});
