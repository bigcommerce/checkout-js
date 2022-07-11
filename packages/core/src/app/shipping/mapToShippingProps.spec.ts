import { createCheckoutService, Cart, Checkout, CheckoutService, StoreConfig } from '@bigcommerce/checkout-sdk';

import { getCart } from '../cart/carts.mock';
import { getPhysicalItem } from '../cart/lineItem.mock';
import { CheckoutContextProps } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import { mapToShippingProps } from './Shipping';

describe('mapToShippingProps()', () => {
    let checkoutContextProps: CheckoutContextProps;
    let checkoutService: CheckoutService;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        checkoutContextProps = {
            checkoutService,
            checkoutState: checkoutService.getState(),
        };
    });

    it('returns null when not initialized', () => {
        expect(mapToShippingProps(checkoutContextProps))
            .toEqual(null);
    });

    describe('shouldShowMultiShipping', () => {
        beforeEach(() => {
            jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());
            jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());
            jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(getCustomer());
            jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue({
                ...getCart(),
                lineItems: {
                    physicalItems: [ {
                        ...getPhysicalItem(),
                        quantity: 3,
                    }],
                },
            } as Cart);
        });

        it('returns true when enabled', () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(mapToShippingProps(checkoutContextProps)!.shouldShowMultiShipping)
                .toEqual(true);
        });

        it('returns false when not enabled', () => {
            jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
                ...getStoreConfig(),
                checkoutSettings: {
                    features: {},
                    hasMultiShippingEnabled: false,
                },
            } as StoreConfig);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(mapToShippingProps(checkoutContextProps)!.shouldShowMultiShipping)
                .toEqual(false);
        });

        it('returns false when no physical items', () => {
            jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue({
                ...getCart(),
                lineItems: {
                    physicalItems: [],
                },
            } as unknown as Cart);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(mapToShippingProps(checkoutContextProps)!.shouldShowMultiShipping)
                .toEqual(false);
        });

        it('returns false when remote shipping', () => {
            jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue({
                ...getCheckout(),
                payments: [{ providerId: 'amazon' }],
            } as Checkout);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(mapToShippingProps(checkoutContextProps)!.shouldShowMultiShipping)
                .toEqual(false);
        });
    });
});
