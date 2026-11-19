import { createCheckoutService, type PaymentMethod } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/contexts';
import { getCart, getCheckout, getPaymentMethod } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import BigCommercePaymentsShopperCurrency from './BigCommercePaymentsShopperCurrency';
import { type ShopperCurrencyOffer } from './shopperCurrency';

describe('BigCommercePaymentsShopperCurrency', () => {
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();

    const getMethod = (offer: Partial<ShopperCurrencyOffer> = {}): PaymentMethod => ({
        ...getPaymentMethod(),
        id: 'bigcommerce_payments',
        initializationData: {
            hasSectionOnTopOfPaymentsList: true,
            shopperCurrencyOffer: {
                currency: 'PLN',
                exchangeRate: '3.59',
                fxId: 'fx-pln',
                expiryTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                countryCode: 'PL',
                isSelected: true,
                hasShopperChoice: true,
                ...offer,
            },
        },
    });

    const renderSection = (method: PaymentMethod) =>
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <BigCommercePaymentsShopperCurrency method={method} />
            </CheckoutProvider>,
        );

    beforeEach(() => {
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
            ...getCheckout(),
            outstandingBalance: 100,
        });
        jest.spyOn(checkoutService, 'loadPaymentMethods').mockResolvedValue(checkoutState);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('offers the cart amount in the shopper currency at the PayPal rate', () => {
        renderSection(getMethod());

        expect(screen.getByTestId('bcp-shopper-currency-option-PLN')).toHaveTextContent('359.00');
        expect(screen.getByTestId('bcp-shopper-currency-option-USD')).toHaveTextContent('$100.00');
        expect(screen.getByText(/1 USD = 3\.59 PLN/)).toBeInTheDocument();
        expect(screen.getByText(/Poland/)).toBeInTheDocument();
    });

    it('marks the currency the shopper pays in', () => {
        renderSection(getMethod());

        expect(screen.getByTestId('bcp-shopper-currency-option-PLN')).toHaveAttribute(
            'aria-pressed',
            'true',
        );
        expect(screen.getByTestId('bcp-shopper-currency-option-USD')).toHaveAttribute(
            'aria-pressed',
            'false',
        );
    });

    it('loads the payment methods of the cart currency when the shopper picks it', () => {
        renderSection(getMethod());

        screen.getByTestId('bcp-shopper-currency-option-USD').click();

        expect(checkoutService.loadPaymentMethods).toHaveBeenCalledWith({
            params: { presentmentCurrency: 'USD' },
        });
    });

    it('loads the payment methods of the shopper currency with the rate they saw', () => {
        renderSection(getMethod({ isSelected: false }));

        screen.getByTestId('bcp-shopper-currency-option-PLN').click();

        expect(checkoutService.loadPaymentMethods).toHaveBeenCalledWith({
            params: { presentmentCurrency: 'PLN', fxId: 'fx-pln' },
        });
    });

    it('preselects the shopper currency before the shopper chooses', () => {
        renderSection(getMethod({ isSelected: false, hasShopperChoice: false }));

        expect(checkoutService.loadPaymentMethods).toHaveBeenCalledWith({
            params: { presentmentCurrency: 'PLN', fxId: 'fx-pln' },
        });
    });

    it('does not preselect once the shopper chose', () => {
        renderSection(getMethod({ isSelected: false }));

        expect(checkoutService.loadPaymentMethods).not.toHaveBeenCalled();
    });

    it('renders nothing without an offer', () => {
        const { container } = renderSection({ ...getPaymentMethod(), initializationData: {} });

        expect(container).toBeEmptyDOMElement();
    });
});
