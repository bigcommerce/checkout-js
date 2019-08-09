import { createCheckoutService, CheckoutSelectors, CheckoutService, CustomError } from '@bigcommerce/checkout-sdk';

import { getCustomer } from '../customer/customers.mock';

import { getCheckout } from './checkouts.mock';
import mapToCheckoutProps from './mapToCheckoutProps';
import { CheckoutContextProps } from './CheckoutContext';

describe('mapToCheckoutProps()', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let contextProps: CheckoutContextProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        contextProps = {
            checkoutService,
            checkoutState,
        };
    });

    it('returns no usable store credit if customer has no store credit', () => {
        const { usableStoreCredit } = mapToCheckoutProps(contextProps);

        expect(usableStoreCredit)
            .toEqual(0);
    });

    it('returns grand total as usable store credit amount if store credit exceeds grand total', () => {
        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue({
                ...getCustomer(),
                storeCredit: 100000000,
            });

        const { usableStoreCredit } = mapToCheckoutProps(contextProps);

        expect(usableStoreCredit)
            .toEqual(getCheckout().grandTotal);
    });

    it('returns store credit as usable store credit amount if store credit is less than grand total', () => {
        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue({
                ...getCustomer(),
                storeCredit: 1,
            });

        const { usableStoreCredit } = mapToCheckoutProps(contextProps);

        expect(usableStoreCredit)
            .toEqual(1);
    });

    it('returns true if unable to submit order because cart has changed', () => {
        jest.spyOn(checkoutState.errors, 'getSubmitOrderError')
            .mockReturnValue({ type: 'cart_changed' } as CustomError);

        const { hasCartChanged } = mapToCheckoutProps(contextProps);

        expect(hasCartChanged)
            .toEqual(true);
    });

    it('returns false if unable to submit order because of other causes', () => {
        jest.spyOn(checkoutState.errors, 'getSubmitOrderError')
            .mockReturnValue({ type: 'unknown' } as CustomError);

        const { hasCartChanged } = mapToCheckoutProps(contextProps);

        expect(hasCartChanged)
            .toEqual(false);
    });
});
