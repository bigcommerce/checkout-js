import { replaceLocation } from '@bigcommerce/checkout/dom-utils';

import navigateToOrderConfirmation from './navigateToOrderConfirmation';

jest.mock('@bigcommerce/checkout/dom-utils', () => ({
    ...jest.requireActual<typeof import('@bigcommerce/checkout/dom-utils')>(
        '@bigcommerce/checkout/dom-utils',
    ),
    replaceLocation: jest.fn(),
}));

describe('navigateToOrderConfirmation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.history.replaceState({}, '', '/checkout');
    });

    it('navigates to order confirmation page based on its current path', () => {
        void navigateToOrderConfirmation();

        expect(replaceLocation).toHaveBeenCalledWith('/checkout/order-confirmation');
    });

    it('navigates to order confirmation page with orderId in the URL when it is a buy now cart checkout', () => {
        window.history.replaceState({}, '', '/checkout?action=buy&products=123:1');

        void navigateToOrderConfirmation(100);

        expect(replaceLocation).toHaveBeenCalledWith('/checkout/order-confirmation/100');
    });

    it('discards any query params when navigating to order confirmation page', () => {
        window.history.replaceState({}, '', '/embedded-checkout?setCurrencyId=1');

        void navigateToOrderConfirmation();

        expect(replaceLocation).toHaveBeenCalledWith('/embedded-checkout/order-confirmation');
    });
});
