import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import CartSummaryDrawer from './CartSummaryDrawer';

describe('CartSummary Component', () => {
    Object.defineProperty(window, 'location', {
        value: {
            pathname: '/checkout',
        },
    });

    it('renders OrderSummaryDrawer with Edit Cart link', async () => {
        const checkoutService = createCheckoutService();
        const localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <CartSummaryDrawer isMultiShippingMode={false} />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        await userEvent.click(screen.getByText(
            localeContext.language.translate('cart.show_details_action'),
        ));

        expect(screen.getByText(
            localeContext.language.translate('cart.edit_cart_action'),
        )).toBeInTheDocument();
    });

    it('renders OrderSummaryDrawer without Edit Cart link for Buy Now carts', async () => {
        const checkoutService = createCheckoutService();
        const localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue({ ...getCheckout(),
        cart: {
            ...getCheckout().cart,
            source: "BUY_NOW",
        } });
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <CartSummaryDrawer isMultiShippingMode={false} />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        await userEvent.click(screen.getByText(
            localeContext.language.translate('cart.show_details_action'),
        ));

        expect(
          screen.queryByText(localeContext.language.translate('cart.edit_cart_action')),
        ).not.toBeInTheDocument();
    });
});
