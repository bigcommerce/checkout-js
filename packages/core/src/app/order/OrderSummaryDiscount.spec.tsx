import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../config/config.mock';

import OrderSummaryDiscount from './OrderSummaryDiscount';
import OrderSummaryPrice from './OrderSummaryPrice';

jest.mock('./OrderSummaryPrice', () => ({label, amount, testId, children, ...props}: any) => (
    <span
        data-test={testId}
        {...props}
    >
        {label}
        {amount}
        {children}
    </span>
));

describe('OrderSummaryDiscount', () => {
    let discount: ReactWrapper;
    let localeContext: LocaleContextType;

    describe('when it is a simple discount', () => {
        beforeEach(() => {
            localeContext = createLocaleContext(getStoreConfig());
            discount = mount(
                <LocaleContext.Provider value={localeContext}>
                    <OrderSummaryDiscount amount={10} label={<span>Foo</span>} />
                </LocaleContext.Provider>,
            );
        });

        it('passes right props to OrderSummaryPrice', () => {
            expect(discount.find(OrderSummaryPrice).props()).toMatchObject({
                amount: -10,
                label: <span>Foo</span>,
            });
        });
    });

    describe('when discount has code and remaining balance', () => {
        beforeEach(() => {
            discount = mount(
                <LocaleContext.Provider value={localeContext}>
                    <OrderSummaryDiscount
                        amount={10}
                        code="ABCDFE"
                        label="Gift Certificate"
                        remaining={2}
                    />
                </LocaleContext.Provider>,
            );
        });

        it('matches snapshot', () => {
            expect(discount.render()).toMatchSnapshot();
        });

        it('renders gift certificate code', () => {
            expect(discount.find('[data-test="cart-price-code"]').text()).toBe('ABCDFE');
        });

        it('renders remaining label', () => {
            expect(discount.find('[data-test="cart-price-remaining"]').text()).toContain(
                'Remaining:',
            );
        });

        it('renders remaining balance', () => {
            expect(
                discount.find('[data-test="cart-price-remaining"] ShopperCurrency').props(),
            ).toMatchObject({ amount: 2 });
        });
    });
});
