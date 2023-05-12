import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import OrderSummary from '../order/OrderSummary';

import CartSummary from './CartSummary';

describe('CartSummary Component', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;
    let component: ReactWrapper;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());
    });

    it('renders OrderSummary with Edit Cart link', () => {
        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/checkout',
            },
            writable: true,
        });
        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <CartSummary />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(component.find(OrderSummary).prop('headerLink')).toMatchSnapshot();
    });

    it('renders OrderSummary without the Edit Cart link for Buy Now carts', () => {
        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/checkout/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
            },
        });

        component = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <CartSummary />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(component.find(OrderSummary).prop('headerLink')).not.toBeTruthy();
    });
});
