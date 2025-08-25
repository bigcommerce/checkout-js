import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    ExtensionCommandType,
} from '@bigcommerce/checkout-sdk';

import { ExtensionActionType, getExtensions } from '../../index';

import { type CommandHandlerProps } from './CommandHandler';
import { createReloadCheckoutHandler } from './createReloadCheckoutHandler';
import { createReRenderShippingFormHandler } from './createReRenderShippingFormHandler';
import { createReRenderShippingStepHandler } from './createReRenderShippingStepHandler';
import { createSetIframeStyleHandler } from './createSetIframeStyleHandler';
import { createShowLoadingIndicatorHandler } from './createShowLoadingIndicatorHandler';

describe('commandHandlers', () => {
    let handlerProps: CommandHandlerProps;
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
        it('reloads checkout', async () => {
            const { handler } = createReloadCheckoutHandler(handlerProps);

            jest.spyOn(checkoutService, 'loadCheckout').mockResolvedValue(
                checkoutService.getState(),
            );

            await handler({
                type: ExtensionCommandType.ReloadCheckout,
            });

            expect(checkoutService.loadCheckout).toHaveBeenCalled();
        });
    });

    describe('createSetIframeStyleHandler', () => {
        it('changes iframe style', () => {
            const { handler } = createSetIframeStyleHandler(handlerProps);
            const container = document.createElement('div');
            const iframe = document.createElement('iframe');
            const style = { width: '100px', height: '200px' };

            jest.spyOn(document, 'querySelector').mockReturnValue(container);
            jest.spyOn(container, 'querySelector').mockReturnValue(iframe);

            void handler({
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
            const { handler } = createShowLoadingIndicatorHandler(handlerProps);

            void handler({
                type: ExtensionCommandType.ShowLoadingIndicator,
                payload: {
                    show,
                },
            });

            expect(handlerProps.dispatch).toHaveBeenCalledWith({
                type: ExtensionActionType.SHOW_LOADING_INDICATOR,
                payload: show,
            });
        });
    });

    describe('createReRenderShippingFormHandler', () => {
        it('reloads checkout and dispatches an action', async () => {
            jest.spyOn(checkoutService, 'loadCheckout').mockResolvedValue(
                {} as Promise<CheckoutSelectors>,
            );

            const { handler } = createReRenderShippingFormHandler(handlerProps);

            await handler({
                type: ExtensionCommandType.ReRenderShippingForm,
            });

            expect(checkoutService.loadCheckout).toHaveBeenCalled();
            expect(handlerProps.dispatch).toHaveBeenCalledWith({
                type: ExtensionActionType.RE_RENDER_SHIPPING_FORM,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                payload: expect.any(Number),
            });
        });
    });

    describe('createReRenderShippingStepHandler', () => {
        it('reloads checkout and dispatches an action', async () => {
            jest.spyOn(checkoutService, 'loadCheckout').mockResolvedValue(
                {} as Promise<CheckoutSelectors>,
            );

            const { handler } = createReRenderShippingStepHandler(handlerProps);

            await handler({
                type: ExtensionCommandType.ReRenderShippingStep,
            });

            expect(checkoutService.loadCheckout).toHaveBeenCalled();
            expect(handlerProps.dispatch).toHaveBeenCalledWith({
                type: ExtensionActionType.RE_RENDER_SHIPPING_FORM,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                payload: expect.any(Number),
            });
        });
    });
});
