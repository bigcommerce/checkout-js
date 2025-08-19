import { type CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { type ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getCheckout } from '../checkout/checkouts.mock';
import { createErrorLogger } from '../common/error';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import CartSummary from './CartSummary';

describe('CartSummary Component', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;
    let errorLogger: ErrorLogger;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());
        errorLogger = createErrorLogger();

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
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider checkoutService={checkoutService} errorLogger={errorLogger}>
                        <CartSummary isMultiShippingMode={false} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.getByTestId('cart-edit-link')).toBeInTheDocument();
    });

    it('renders OrderSummary without the Edit Cart link for Buy Now carts', () => {
        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/checkout',
                search: '?action=buy&products=111:2',
            },
        });

        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider checkoutService={checkoutService} errorLogger={errorLogger} >
                        <CartSummary isMultiShippingMode={false}/>
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.queryByTestId('cart-edit-link')).not.toBeInTheDocument();
    });
});
