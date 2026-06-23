import {
    type CheckoutService,
    createCheckoutService,
    type CurrencyService,
} from '@bigcommerce/checkout-sdk';
import React from 'react';

import { CheckoutProvider, LocaleContext } from '@bigcommerce/checkout/contexts';
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
                bundleLabel: 'Accessories',
                quantityBackordered: 2,
                quantityOnHand: 3,
                backorderMessage: 'Ships in 5 days',
            },
            {
                id: 'b2',
                name: 'Bundled Scarf',
                bundleLabel: 'Accessories',
            },
        ];

        it('renders each bundled item name with its bundle label', () => {
            render(
                <OrderSummaryItem
                    orderItem={{
                        amount: 10,
                        id: 'foo',
                        name: 'Product',
                        quantity: 1,
                        bundledItems,
                    }}
                    shouldExpandBackorderDetails={false}
                />,
            );

            const nameEls = screen.getAllByTestId('cart-item-bundled-item-name');

            expect(nameEls).toHaveLength(2);
            expect(nameEls[0]).toHaveTextContent('Accessories: Bundled Hat');
            expect(nameEls[1]).toHaveTextContent('Accessories: Bundled Scarf');
        });

        it('falls back to the default bundle label when a bundled item has no bundleLabel', () => {
            render(
                <OrderSummaryItem
                    orderItem={{
                        amount: 10,
                        id: 'foo',
                        name: 'Product',
                        quantity: 1,
                        bundledItems: [{ id: 'b1', name: 'Bundled Hat' }],
                    }}
                    shouldExpandBackorderDetails={false}
                />,
            );

            const nameEl = screen.getByTestId('cart-item-bundled-item-name');

            expect(nameEl).toHaveTextContent('Bundle: Bundled Hat');
            expect(nameEl).not.toHaveTextContent('Bundle::');
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

        it('renders bundled items in a <ul> element', () => {
            render(
                <OrderSummaryItem
                    orderItem={{
                        amount: 10,
                        id: 'foo',
                        name: 'Product',
                        quantity: 1,
                        bundledItems,
                    }}
                    shouldExpandBackorderDetails={false}
                />,
            );

            expect(screen.getByRole('list')).toBeInTheDocument();
        });

        it('does not render the bundled items container when bundledItems is an empty array', () => {
            render(
                <OrderSummaryItem
                    orderItem={{
                        amount: 10,
                        id: 'foo',
                        name: 'Product',
                        quantity: 1,
                        bundledItems: [],
                    }}
                    shouldExpandBackorderDetails={false}
                />,
            );

            expect(screen.queryByRole('list')).not.toBeInTheDocument();
        });
    });

    describe('when bundled items are backordered and details are expanded', () => {
        let checkoutService: CheckoutService;

        const renderWithConfig = (shouldExpandBackorderDetails: boolean) =>
            render(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleContext.Provider value={localeContext}>
                        <OrderSummaryItem
                            orderItem={{
                                amount: 10,
                                id: 'foo',
                                name: 'Product',
                                quantity: 1,
                                bundledItems: [
                                    {
                                        id: 'b1',
                                        name: 'Bundled Hat',
                                        bundleLabel: 'Accessories',
                                        quantityBackordered: 2,
                                        quantityOnHand: 3,
                                        backorderMessage: 'Ships in 5 days',
                                    },
                                ],
                            }}
                            shouldExpandBackorderDetails={shouldExpandBackorderDetails}
                        />
                    </LocaleContext.Provider>
                </CheckoutProvider>,
            );

        beforeEach(() => {
            checkoutService = createCheckoutService();

            jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
                ...getStoreConfig(),
                inventorySettings: {
                    showQuantityOnBackorder: true,
                    showBackorderMessage: true,
                    showQuantityOnHand: false,
                    showBackorderAvailabilityPrompt: false,
                    backorderAvailabilityPrompt: null,
                    showDefaultShippingExpectationPrompt: false,
                    defaultShippingExpectationPrompt: null,
                    shouldDisplayBackorderMessagesOnStorefront: true,
                },
            });
        });

        it('renders the backorder quantity and message for the bundled child item', () => {
            renderWithConfig(true);

            expect(screen.getByTestId('cart-item-backorder-qty')).toBeInTheDocument();
            expect(screen.getByTestId('cart-item-backorder-message')).toHaveTextContent(
                'Ships in 5 days',
            );
        });

        it('does not render the bundled child backorder details when collapsed', () => {
            renderWithConfig(false);

            expect(screen.queryByTestId('cart-item-backorder-qty')).not.toBeInTheDocument();
            expect(screen.queryByTestId('cart-item-backorder-message')).not.toBeInTheDocument();
        });
    });
});
