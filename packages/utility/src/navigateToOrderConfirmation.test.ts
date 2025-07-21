import navigateToOrderConfirmation from './navigateToOrderConfirmation';

describe('navigateToOrderConfirmation', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: {
                href: 'https://store.com/checkout',
                pathname: '/checkout',
                search: '',
                replace: jest.fn(),
            },
            writable: true,
        });
    });

    it('navigates to order confirmation page based on its current path', () => {
        void navigateToOrderConfirmation();

        expect(window.location.replace).toHaveBeenCalledWith('/checkout/order-confirmation');
    });

    it('navigates to order confirmation page with orderId in the URL when it is a buy now cart checkout', () => {
        window.location.search = '?action=buy&products=123:1';

        void navigateToOrderConfirmation(100);

        expect(window.location.replace).toHaveBeenCalledWith('/checkout/order-confirmation/100');
    });

    it('discards any query params when navigating to order confirmation page', () => {
        window.location.href = 'https://store.com/embedded-checkout?setCurrencyId=1';
        window.location.pathname = '/embedded-checkout';

        void navigateToOrderConfirmation();

        expect(window.location.replace).toHaveBeenCalledWith(
            '/embedded-checkout/order-confirmation',
        );
    });
});
