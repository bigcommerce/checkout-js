import { createCheckoutService, CheckoutSelectors, CheckoutService, CustomError } from '@bigcommerce/checkout-sdk';

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
