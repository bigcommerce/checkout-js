import { Cart, CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';

import { getCart } from '../../cart/carts.mock';
import { getPhysicalItem } from '../../cart/lineItem.mock';
import { CheckoutContextProps } from '../../checkout';
import { getCheckout } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { getConsignment } from '../consignment.mock';

import { mapToShippingOptions } from './ShippingOptions';

describe('mapToShippingProps()', () => {
    let checkoutContextProps: CheckoutContextProps;
    let checkoutService: CheckoutService;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        checkoutContextProps = {
            checkoutService,
            checkoutState: checkoutService.getState(),
        };

        const unsortedConsignments = [
            {
                ...getConsignment(),
                id: 'foo',
                lineItemIds: ['itemB'],
            },
            {
                ...getConsignment(),
                id: 'bar',
                lineItemIds: ['itemC'],
            },
            {
                ...getConsignment(),
                id: 'foobar',
                lineItemIds: ['itemA'],
            },
        ];

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutService.getState().data, 'getConsignments').mockReturnValue(
            unsortedConsignments,
        );
        jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue({
            ...getCart(),
            lineItems: {
                physicalItems: [
                    { ...getPhysicalItem(), id: 'itemA' },
                    { ...getPhysicalItem(), id: 'itemB' },
                    { ...getPhysicalItem(), id: 'itemC' },
                ],
            },
        } as Cart);
    });

    it('returns null when not initialized', () => {
        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(undefined);

        expect(
            mapToShippingOptions(checkoutContextProps, {
                shouldShowShippingOptions: true,
                isMultiShippingMode: true,
            }),
        ).toBeNull();
    });

    it('returns sorted consignments in respect of line items order', () => {
        const unsortedConsignments = checkoutService.getState().data.getConsignments();

        if (unsortedConsignments) {
            const sortedConsignments = [
                unsortedConsignments[2],
                unsortedConsignments[0],
                unsortedConsignments[1],
            ];

            expect(
                mapToShippingOptions(checkoutContextProps, {
                    shouldShowShippingOptions: true,
                    isMultiShippingMode: true,
                })?.consignments,
            ).toEqual(sortedConsignments);
        }
    });
});
