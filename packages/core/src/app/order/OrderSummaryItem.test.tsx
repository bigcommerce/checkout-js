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

    describe('when productOptions include an isMainBundledItem option', () => {
        it('renders a pick-list option name in bold', () => {
            render(
                <OrderSummaryItem
                    orderItem={{
                        amount: 10,
                        id: 'foo',
                        name: 'Product',
                        quantity: 1,
                        productOptions: [
                            {
                                testId: 'cart-item-product-option',
                                content: 'Pick List: Item A',
                                name: 'Pick List:',
                                value: 'Item A',
                                isMainBundledItem: true,
                            },
                            {
                                testId: 'cart-item-product-option',
                                content: 'Color: Blue',
                                name: 'Color:',
                                value: 'Blue',
                                isMainBundledItem: false,
                            },
                        ],
                    }}
                    shouldExpandBackorderDetails={false}
                />,
            );

            const options = screen.getAllByTestId('cart-item-product-option');

            expect(options[0].querySelector('.body-bold')).toBeInTheDocument();
            expect(options[0]).toHaveTextContent('Pick List: Item A');
            expect(options[1].querySelector('.body-bold')).not.toBeInTheDocument();
        });
    });

    describe('when a product option has stockPosition backorder details', () => {
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
                                productOptions: [
                                    {
                                        testId: 'cart-item-product-option',
                                        content: 'Pick List: Item A',
                                        name: 'Pick List:',
                                        value: 'Item A',
                                        isMainBundledItem: true,
                                        stockPosition: {
                                            quantityBackordered: 2,
                                            quantityOnHand: 3,
                                            backorderMessage: 'Ships in 5 days',
                                        },
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

        it('renders backorder quantity and message when expanded', () => {
            renderWithConfig(true);

            expect(screen.getByTestId('cart-item-backorder-qty')).toBeInTheDocument();
            expect(screen.getByTestId('cart-item-backorder-message')).toHaveTextContent(
                'Ships in 5 days',
            );
        });

        it('does not render backorder details when collapsed', () => {
            renderWithConfig(false);

            expect(screen.queryByTestId('cart-item-backorder-qty')).not.toBeInTheDocument();
            expect(screen.queryByTestId('cart-item-backorder-message')).not.toBeInTheDocument();
        });
    });
});
