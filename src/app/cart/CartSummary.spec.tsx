import { createCheckoutService, CheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { CheckoutProvider } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';
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

        component = mount(
            <CheckoutProvider checkoutService={ checkoutService }>
                <LocaleContext.Provider value={ localeContext }>
                    <CartSummary />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders OrderSummary with Edit Cart link', () => {
        expect(component.find(OrderSummary).prop('headerLink'))
            .toMatchSnapshot();
    });

    it('renders OrderSummary without the Edit Cart link for Buy Now carts', () => {
        jest.spyOn(window, 'window', 'get').mockImplementation(() => ({
            location: {
                pathname: '/checkout/buy-now-checkout-id',
            },
        }) as any);

        expect(component.find(OrderSummary).prop('headerLink')).not.toBeTruthy();
    });
});
