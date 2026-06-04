import { type CurrencyService } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import OrderSummaryItem from './OrderSummaryItem';

describe('OrderSummaryItem', () => {
    const localeContext = createLocaleContext(getStoreConfig());
    const currencyService: CurrencyService = localeContext.currency;

    describe('when amount and amountAfterDiscount are different', () => {
        it('renders component', () => {
            render(
                <OrderSummaryItem
                    orderItem={{
                        amount: 10,
                        amountAfterDiscount: 8,
                        id: 'foo',
                        image: <img />,
                        name: 'Product',
                        productOptions: [
                            {
                                testId: 'test-id',
                                content: <span />,
                            },
                        ],
                        quantity: 2,
                    }}
                    shouldExpandBackorderDetails={false}
                />,
            );

            expect(screen.getByRole('heading', { name: '2 x Product' })).toBeInTheDocument();
            expect(screen.getByText(currencyService.toCustomerCurrency(10))).toBeInTheDocument();
            expect(
                screen.getByTestId('cart-item-product-price--afterDiscount'),
            ).toBeInTheDocument();
            expect(screen.getByTestId('cart-item-product-price')).toHaveClass(
                'product-price--beforeDiscount',
            );
            expect(screen.getByText(currencyService.toCustomerCurrency(8))).toBeInTheDocument();
        });
    });

    describe('when no discount is present', () => {
        it('does not render discount and does not apply strike to original amount', () => {
            render(
                <OrderSummaryItem
                    orderItem={{ amount: 10, id: 'foo', name: 'Product', quantity: 2 }}
                    shouldExpandBackorderDetails={false}
                />,
            );

            expect(
                screen.queryByTestId('cart-item-product-price--afterDiscount'),
            ).not.toBeInTheDocument();
            expect(screen.queryByTestId('cart-item-product-price')).not.toHaveClass(
                'product-price--beforeDiscount',
            );
        });
    });

    describe('when amount and amountAfterDiscount are the same', () => {
        it('does not render discount and does not apply strike to original amount', () => {
            render(
                <OrderSummaryItem
                    orderItem={{
                        amount: 10,
                        amountAfterDiscount: 10,
                        id: 'foo',
                        name: 'Product',
                        quantity: 2,
                    }}
                    shouldExpandBackorderDetails={false}
                />,
            );

            expect(
                screen.queryByTestId('cart-item-product-price--afterDiscount'),
            ).not.toBeInTheDocument();
            expect(screen.queryByTestId('cart-item-product-price')).not.toHaveClass(
                'product-price--beforeDiscount',
            );
        });
    });

    describe('when description is present', () => {
        it('does render description', () => {
            render(
                <OrderSummaryItem
                    orderItem={{
                        amount: 10,
                        description: 'Description',
                        id: 'foo',
                        name: 'Product',
                        quantity: 2,
                    }}
                    shouldExpandBackorderDetails={false}
                />,
            );

            expect(screen.getByTestId('cart-item-product-description')).toHaveTextContent(
                'Description',
            );
        });
    });

    describe('when bundledItems are present', () => {
        const bundledItems = [
            {
                id: 'b1',
                name: 'Bundled Hat',
                quantityBackordered: 2,
                quantityOnHand: 3,
                backorderMessage: 'Ships in 5 days',
            },
            {
                id: 'b2',
                name: 'Bundled Scarf',
            },
        ];

        it('renders each bundled item name with the Bundle label', () => {
            render(
                <OrderSummaryItem
                    orderItem={{ amount: 10, id: 'foo', name: 'Product', quantity: 1, bundledItems }}
                    shouldExpandBackorderDetails={false}
                />,
            );

            const nameEls = screen.getAllByTestId('cart-item-bundled-item-name');

            expect(nameEls).toHaveLength(2);
            expect(nameEls[0]).toHaveTextContent('Bundled Hat');
            expect(nameEls[1]).toHaveTextContent('Bundled Scarf');
        });

        it('renders nothing for bundled items section when bundledItems is undefined', () => {
            render(
                <OrderSummaryItem
                    orderItem={{ amount: 10, id: 'foo', name: 'Product', quantity: 1 }}
                    shouldExpandBackorderDetails={false}
                />,
            );

            expect(screen.queryByTestId('cart-item-bundled-item-name')).not.toBeInTheDocument();
        });

        it('renders a bundled-items-container element', () => {
            const { container } = render(
                <OrderSummaryItem
                    orderItem={{ amount: 10, id: 'foo', name: 'Product', quantity: 1, bundledItems }}
                    shouldExpandBackorderDetails={false}
                />,
            );

            expect(container.querySelector('.bundled-items-container')).toBeInTheDocument();
        });
    });
});
