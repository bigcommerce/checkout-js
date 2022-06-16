import navigateToOrderConfirmation from './navigateToOrderConfirmation';

describe('navigateToOrderConfirmation', () => {
    let locationMock: Pick<Location, 'pathname' | 'href' | 'replace'>;

    beforeEach(() => {
        locationMock = {
            href: 'https://store.com/checkout',
            pathname: '/checkout',
            replace: jest.fn(),
        };
    });

    it('navigates to order confirmation page based on its current path', () => {
        navigateToOrderConfirmation(locationMock as Location);

        expect(locationMock.replace)
            .toHaveBeenCalledWith('/checkout/order-confirmation');
    });

    it('navigates to order confirmation page with orderId in the URL when it is a buy now cart checkout', () => {
        locationMock = {
            ...locationMock,
            pathname: '/checkout/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
        };
        jest.spyOn(window, 'window', 'get').mockImplementation(() => ({ location: locationMock }) as any);

        navigateToOrderConfirmation(locationMock as Location, 100);

        expect(locationMock.replace)
            .toHaveBeenCalledWith('/checkout/order-confirmation/100');
    });

    it('discards any query params when navigating to order confirmation page', () => {
        locationMock.href = 'https://store.com/embedded-checkout?setCurrencyId=1';
        locationMock.pathname = '/embedded-checkout';

        navigateToOrderConfirmation(locationMock as Location);

        expect(locationMock.replace)
            .toHaveBeenCalledWith('/embedded-checkout/order-confirmation');
    });
});
