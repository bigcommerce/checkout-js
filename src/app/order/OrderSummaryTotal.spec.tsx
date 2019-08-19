import { mount } from 'enzyme';
import React from 'react';

import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType, TranslatedString } from '../locale';

import OrderSummaryPrice from './OrderSummaryPrice';
import OrderSummaryTotal from './OrderSummaryTotal';

describe('OrderSummaryTotal', () => {
    let localeContext: LocaleContextType;
    let orderSummaryTotal: any;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
    });

    describe('when shopper has same currency as store', () => {
        beforeEach(() => {
            orderSummaryTotal = mount(
                <LocaleContext.Provider value={ localeContext }>
                    <OrderSummaryTotal
                        orderAmount={ 100 }
                        shopperCurrencyCode="USD"
                        storeCurrencyCode="USD"
                    />
                </LocaleContext.Provider>);
        });

        it('passes right props to OrderSummaryPrice', () => {
            expect(orderSummaryTotal.find(OrderSummaryPrice).props())
                .toMatchObject({
                    amount: 100,
                    superscript: undefined,
                });
        });

        it('displays total in store currency', () => {
            expect(orderSummaryTotal.find('[data-test="cart-total"]').text())
                .toEqual('Total (USD)  $112.00');
        });
    });

    describe('when shopper has different currency as store', () => {
        beforeEach(() => {
            orderSummaryTotal = mount(
                <LocaleContext.Provider value={ localeContext }>
                    <OrderSummaryTotal
                        orderAmount={ 100 }
                        shopperCurrencyCode="USD"
                        storeCurrencyCode="EUR"
                    />
                </LocaleContext.Provider>);
        });

        it('passes right props to OrderSummaryPrice', () => {
            expect(orderSummaryTotal.find(OrderSummaryPrice).props())
                .toMatchObject({
                    amount: 100,
                    superscript: '*',
                });
        });

        it('passes right props to currency text', () => {
            expect(orderSummaryTotal.find('[data-test="cart-price-item-total-note"]').find(TranslatedString).props())
                .toMatchObject({
                    id: 'cart.billed_amount_text',
                    data: {
                        code: 'EUR',
                        total: '$100.00',
                    },
                });
        });

        it('displays estimated total in shopper currency', () => {
            expect(orderSummaryTotal.find('[data-test="cart-total"]').text())
                .toEqual('Estimated Total (USD)  $112.00*');
        });
    });
});
