import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import OrderSummaryDiscount from './OrderSummaryDiscount';

describe('OrderSummaryDiscount', () => {
    const localeContext: LocaleContextType = createLocaleContext(getStoreConfig());

    describe('when it is a simple discount', () => {
        it('renders order summary simple discount', () => {
            render(
                <LocaleContext.Provider value={localeContext}>
                    <OrderSummaryDiscount amount={10} label={<span>Foo</span>} />
                </LocaleContext.Provider>,
            );

            expect(screen.getByText('Foo')).toBeInTheDocument();
            expect(screen.getByText('-$11.20')).toBeInTheDocument();
            expect(screen.queryByTestId('cart-price-remaining')).not.toBeInTheDocument();
            expect(screen.queryByText('ABCDFE')).not.toBeInTheDocument();
        });
    });

    describe('when discount has code and remaining balance', () => {
        it('renders order summary discount', () => {
            render(
                <LocaleContext.Provider value={localeContext}>
                    <OrderSummaryDiscount
                        amount={10}
                        code="ABCDFE"
                        label="Gift Certificate"
                        remaining={2}
                    />
                </LocaleContext.Provider>,
            );

            expect(screen.getByText('Gift Certificate')).toBeInTheDocument();
            expect(screen.getByText('-$11.20')).toBeInTheDocument();
            expect(screen.getByTestId('cart-price-remaining')).toHaveTextContent("Remaining: $2.24");
            expect(screen.getByText('ABCDFE')).toBeInTheDocument();
        });
    });
});
