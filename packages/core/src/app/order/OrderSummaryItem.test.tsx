import { type CurrencyService } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import OrderSummaryItem from './OrderSummaryItem';

describe('OrderSummaryItems', () => {
    const localeContext = createLocaleContext(getStoreConfig());
    const currencyService: CurrencyService = localeContext.currency;

    describe('when amount and amountAfterDiscount are different', () => {
        it('renders component', () => {
            render(
                <OrderSummaryItem
                    amount={10}
                    amountAfterDiscount={8}
                    id="foo"
                    image={<img />}
                    name="Product"
                    productOptions={[
                        {
                            testId: 'test-id',
                            content: <span />,
                        },
                    ]}
                    quantity={2}
                />,
            );

            expect(screen.getByRole('heading', { name: '2 x Product' })).toBeInTheDocument();
            expect(screen.getByText(currencyService.toCustomerCurrency(10))).toBeInTheDocument();
            expect(screen.getByTestId('cart-item-product-price--afterDiscount')).toBeInTheDocument();
            expect(screen.getByTestId('cart-item-product-price')).toHaveClass('product-price--beforeDiscount');
            expect(screen.getByText(currencyService.toCustomerCurrency(8))).toBeInTheDocument();
        });
    });

    describe('when no discount is present', () => {
        it('does not render discount and does not apply strike to original amount', () => {
            render(
                <OrderSummaryItem amount={10} id="foo" name="Product" quantity={2} />,
            );

            expect(screen.queryByTestId('cart-item-product-price--afterDiscount')).not.toBeInTheDocument();
            expect(screen.queryByTestId('cart-item-product-price')).not.toHaveClass('product-price--beforeDiscount');
        });
    });

    describe('when amount and amountAfterDiscount are the same', () => {
        it('does not render discount and does not apply strike to original amount', () => {
            render(
                <OrderSummaryItem
                    amount={10}
                    amountAfterDiscount={10}
                    id="foo"
                    name="Product"
                    quantity={2}
                />
            );

            expect(screen.queryByTestId('cart-item-product-price--afterDiscount')).not.toBeInTheDocument();
            expect(screen.queryByTestId('cart-item-product-price')).not.toHaveClass('product-price--beforeDiscount');
        });
    });

    describe('when description is present', () => {
        it('does render description', () => {
            render(
                <OrderSummaryItem
                    amount={10}
                    description="Description"
                    id="foo"
                    name="Product"
                    quantity={2}
                />
            )

            expect(screen.getByTestId('cart-item-product-description')).toHaveTextContent('Description');
        });
    });
});
