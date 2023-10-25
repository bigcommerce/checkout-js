import {
    createCheckoutService,
    ExtensionCommandType,
    ExtensionRegion,
} from '@bigcommerce/checkout-sdk';

import { getExtensions } from './Extension.mock';
import { ExtensionRegionContainer } from './ExtensionRegionContainer';
import { ExtensionService } from './ExtensionService';

describe('ExtensionService', () => {
    const remover = jest.fn();
    const dispatch = jest.fn();
    const checkoutService = createCheckoutService();

    let extensionService: ExtensionService;

    beforeEach(() => {
        jest.spyOn(checkoutService, 'loadExtensions').mockReturnValue(
            Promise.resolve(checkoutService.getState()),
        );
        jest.spyOn(checkoutService, 'renderExtension').mockReturnValue(
            Promise.resolve(checkoutService.getState()),
        );
        jest.spyOn(checkoutService, 'handleExtensionCommand').mockReturnValue(remover);
        jest.spyOn(checkoutService.getState().data, 'getExtensions').mockReturnValue(
            getExtensions(),
        );
        jest.spyOn(checkoutService.getState().data, 'getExtensionByRegion').mockReturnValue(
            getExtensions()[0],
        );

        extensionService = new ExtensionService(checkoutService, dispatch);
    });

    it('loads extensions', async () => {
        await extensionService.loadExtensions();

        expect(checkoutService.loadExtensions).toHaveBeenCalled();
    });

    it('renders an extension', async () => {
        await extensionService.renderExtension(
            ExtensionRegionContainer.ShippingShippingAddressFormBefore,
            ExtensionRegion.ShippingShippingAddressFormBefore,
        );

        expect(checkoutService.renderExtension).toHaveBeenCalledWith(
            ExtensionRegionContainer.ShippingShippingAddressFormBefore,
            ExtensionRegion.ShippingShippingAddressFormBefore,
        );
    });

    it('adds and removes command handlers', async () => {
        await extensionService.renderExtension(
            ExtensionRegionContainer.ShippingShippingAddressFormBefore,
            ExtensionRegion.ShippingShippingAddressFormBefore,
        );
        expect(checkoutService.handleExtensionCommand).toHaveBeenNthCalledWith(
            1,
            '123',
            ExtensionCommandType.ReloadCheckout,
            expect.any(Function),
        );
        expect(checkoutService.handleExtensionCommand).toHaveBeenNthCalledWith(
            2,
            '123',
            ExtensionCommandType.SetIframeStyle,
            expect.any(Function),
        );
        expect(checkoutService.handleExtensionCommand).toHaveBeenNthCalledWith(
            3,
            '123',
            ExtensionCommandType.ShowLoadingIndicator,
            expect.any(Function),
        );

        extensionService.removeListeners(ExtensionRegion.ShippingShippingAddressFormBefore);

        expect(remover).toBeCalledTimes(3);
    });

    describe('isRegionInUse()', () => {
        it('returns true when checking if a region is in use', () => {
            expect(
                extensionService.isRegionEnabled(ExtensionRegion.ShippingShippingAddressFormBefore),
            ).toBe(true);
        });

        it('returns false when checking if a region is not in use', () => {
            jest.spyOn(checkoutService.getState().data, 'getExtensionByRegion').mockReturnValue(
                undefined,
            );

            expect(
                extensionService.isRegionEnabled(ExtensionRegion.ShippingShippingAddressFormAfter),
            ).toBe(false);
        });
    });
});
