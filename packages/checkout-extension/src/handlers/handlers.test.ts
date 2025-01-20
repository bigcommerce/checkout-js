import {
    Checkout,
    CheckoutService,
    Consignment,
    createCheckoutService,
    ExtensionCommandType,
    ExtensionMessageType,
} from '@bigcommerce/checkout-sdk';

import { ExtensionActionType, getExtensions } from '../';

import { HandlerProps } from './CommandHandler';
import { createGetConsignmentHandler } from './createGetConsignmentHandler';
import { createReloadCheckoutHandler } from './createReloadCheckoutHandler';
import { createSetIframeStyleHandler } from './createSetIframeStyleHandler';
import { createShowLoadingIndicatorHandler } from './createShowLoadingIndicatorHandler';

describe('Handlers', () => {
    let handlerProps: HandlerProps;
    let checkoutService: CheckoutService;

    const dispatch = jest.fn();

    beforeEach(() => {
        checkoutService = createCheckoutService();
        handlerProps = {
            checkoutService,
            dispatch,
            extension: getExtensions()[0],
        };
    });

    describe('createReloadCheckoutHandler', () => {
        it('reloads checkout', () => {
            const handler = createReloadCheckoutHandler(handlerProps);

            const loadCheckout = jest.spyOn(checkoutService, 'loadCheckout');

            handler.handler({
                type: ExtensionCommandType.ReloadCheckout,
            });

            expect(loadCheckout).toHaveBeenCalled();
        });
    });

    describe('createSetIframeStyleHandler', () => {
        it('changes iframe style', () => {
            const handler = createSetIframeStyleHandler(handlerProps);
            const container = document.createElement('div');
            const iframe = document.createElement('iframe');
            const style = { width: '100px', height: '200px' };

            jest.spyOn(document, 'querySelector').mockReturnValue(container);
            jest.spyOn(container, 'querySelector').mockReturnValue(iframe);

            handler.handler({
                type: ExtensionCommandType.SetIframeStyle,
                payload: {
                    style,
                },
            });

            expect(iframe.style).toEqual(expect.objectContaining(style));
        });
    });

    describe('createShowLoadingIndicatorHandler', () => {
        it('dispatches an action', () => {
            const show = true;
            const handler = createShowLoadingIndicatorHandler(handlerProps);

            handler.handler({
                type: ExtensionCommandType.ShowLoadingIndicator,
                payload: {
                    show,
                },
            });

            expect(dispatch).toHaveBeenCalledWith({
                type: ExtensionActionType.SHOW_LOADING_INDICATOR,
                payload: show,
            });
        });
    });

    describe('createGetConsignmentHandler', () => {
        it('posts a message to an extension', () => {
            const handler = createGetConsignmentHandler(handlerProps);
            const consignments: Consignment[] = [];

            jest.spyOn(checkoutService, 'postMessageToExtension');
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue({
                consignments,
            } as Checkout);

            handler.handler({
                type: ExtensionCommandType.GetConsignments,
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
    });
});
