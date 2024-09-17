import {
    CheckoutService,
    createCheckoutService,
    ExtensionCommandType,
} from '@bigcommerce/checkout-sdk';

import { ExtensionActionType, getExtensions } from '../';

import { HandlerProps } from './CommandHandler';
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
                payload: {
                    extensionId: '123',
                },
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
                    extensionId: '123',
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
                    extensionId: '123',
                    show,
                },
            });

            expect(dispatch).toHaveBeenCalledWith({
                type: ExtensionActionType.SHOW_LOADING_INDICATOR,
                payload: show,
            });
        });
    });
});
