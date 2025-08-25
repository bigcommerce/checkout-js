import { createCheckoutService, type CurrencyService } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import OrderSummaryTotal from './OrderSummaryTotal';

describe('OrderSummaryTotal', () => {
    let localeContext: LocaleContextType;
    let currencyService: CurrencyService;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        currencyService = localeContext.currency;
    });

    describe('when shopper has same currency as store', () => {
        it('displays total in store currency', () => {
            render(
                <CheckoutProvider checkoutService={createCheckoutService()}>
                    <LocaleContext.Provider value={localeContext}>
                        <OrderSummaryTotal
                            orderAmount={100}
                            shopperCurrencyCode="USD"
                            storeCurrencyCode="USD"
                        />
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

            expect(screen.getByText('Total (USD)')).toBeInTheDocument();
            expect(screen.getByText(currencyService.toCustomerCurrency(100))).toBeInTheDocument();
        });
    });

    describe('when shopper has different currency as store', () => {
        it('displays estimated total in shopper currency', () => {
            render(
                <CheckoutProvider checkoutService={createCheckoutService()}>
                    <LocaleContext.Provider value={localeContext}>
                        <OrderSummaryTotal
                            orderAmount={100}
                            shopperCurrencyCode="USD"
                            storeCurrencyCode="EUR"
                        />
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

            expect(screen.getByTestId('cart-total')).toHaveTextContent(`Estimated Total (USD) ${currencyService.toCustomerCurrency(100)}*`);
        });
    });
});
