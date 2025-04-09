import { createCheckoutService, Order } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import { getOrder, getOrderWithShippingDiscount } from './orders.mock';
import OrderSummary, { OrderSummaryProps } from './OrderSummary';
import { OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
import PrintLink from './PrintLink';

let order: Order;
let OrderSummaryTest: FunctionComponent<OrderSummaryProps & OrderSummarySubtotalsProps>;

jest.mock('../currency', () => ({
    ShopperCurrency: ({ amount }: {amount: number}) => <div data-test="ShopperCurrency">{amount}</div>
}));

describe('OrderSummary', () => {
    const checkoutService = createCheckoutService();

    describe('when shopper has same currency as store', () => {
        beforeEach(() => {
            order = getOrder();

            OrderSummaryTest = () => (
                <CheckoutProvider checkoutService={checkoutService}>
                    <ExtensionProvider checkoutService={checkoutService}>
                        <LocaleProvider checkoutService={checkoutService}>
                            <OrderSummary
                                {...mapToOrderSummarySubtotalsProps(order, true)}
                                headerLink={<PrintLink />}
                                lineItems={order.lineItems}
                                shopperCurrency={getStoreConfig().shopperCurrency}
                                storeCurrency={getStoreConfig().currency}
                                total={order.orderAmount}
                            />
                        </LocaleProvider>
                    </ExtensionProvider>
                </CheckoutProvider>
            );
        });

        it('renders order summary', () => {
            render(<OrderSummaryTest />);

            expect(screen.getByText('Order Summary')).toBeInTheDocument();
            expect(screen.getByText('2 Items')).toBeInTheDocument();
            expect(screen.getByText(order.coupons[0].code)).toBeInTheDocument();
            expect(screen.getByText(order.coupons[1].code)).toBeInTheDocument();
            expect(screen.getByText(`1 x ${order.lineItems.giftCertificates[0].name}`)).toBeInTheDocument();
        });

        it('does not render currency cart note', () => {
            const { container } = render(<OrderSummaryTest />);

            // eslint-disable-next-line testing-library/no-container
            expect(container.querySelector('.cart-note')).toBeNull();
        });
    });

    describe('when taxes are inclusive', () => {
        it('displays tax as summary section', () => {
            const taxIncludedOrder = {
                ...getOrder(),
                isTaxIncluded: true,
            };

            const { container } = render(
                <CheckoutProvider checkoutService={checkoutService}>
                    <ExtensionProvider checkoutService={checkoutService}>
                        <LocaleProvider checkoutService={checkoutService}>
                            <OrderSummary
                                {...mapToOrderSummarySubtotalsProps(taxIncludedOrder, true)}
                                headerLink={<PrintLink />}
                                lineItems={taxIncludedOrder.lineItems}
                                shopperCurrency={getStoreConfig().shopperCurrency}
                                storeCurrency={getStoreConfig().currency}
                                total={taxIncludedOrder.orderAmount}
                            />
                        </LocaleProvider>
                    </ExtensionProvider>
                </CheckoutProvider>,
            );

            expect(screen.getByText('Order Summary')).toBeInTheDocument();
            expect(screen.getByText('2 Items')).toBeInTheDocument();
            expect(screen.getByText(taxIncludedOrder.coupons[0].code)).toBeInTheDocument();
            expect(screen.getByText(taxIncludedOrder.coupons[1].code)).toBeInTheDocument();
            expect(screen.getByText(`1 x ${taxIncludedOrder.lineItems.giftCertificates[0].name}`)).toBeInTheDocument();
            expect(screen.getByText('Tax Included in Total:')).toBeInTheDocument();
            // eslint-disable-next-line testing-library/no-container
            expect(container.querySelector('.cart-taxItem')).toBeInTheDocument();
        });
    });

    describe('when shipping discount is applied', () => {
        it('displays the original shipping price as a strikethrough in the summary section.', () => {
            const order = getOrderWithShippingDiscount();

            render(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleProvider checkoutService={checkoutService}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <OrderSummary
                                {...mapToOrderSummarySubtotalsProps(order, true)}
                                headerLink={<PrintLink />}
                                lineItems={order.lineItems}
                                shopperCurrency={getStoreConfig().shopperCurrency}
                                storeCurrency={getStoreConfig().currency}
                                total={order.orderAmount}
                            />
                        </ExtensionProvider>
                    </LocaleProvider>
                </CheckoutProvider>,
            );

            expect(screen.getByText('Order Summary')).toBeInTheDocument();
            expect(screen.getByText('2 Items')).toBeInTheDocument();

            const shippingCostInOrderSummary = screen.getByTestId('cart-shipping');

            expect(shippingCostInOrderSummary).toHaveTextContent('Shipping');
            expect(shippingCostInOrderSummary).toHaveTextContent('20');
            expect(shippingCostInOrderSummary).toHaveTextContent('12');

            const couponDetailInOrderSummary = screen.getByTestId('cart-coupon');

            expect(couponDetailInOrderSummary).toHaveTextContent('279F507D817E3E7');
            expect(couponDetailInOrderSummary).toHaveTextContent('3');
        });

        it('does not display strikethrough shipping discount when experiment is off', () => {
            const order = getOrderWithShippingDiscount();

            render(
                <CheckoutProvider checkoutService={checkoutService}>
                    <LocaleProvider checkoutService={checkoutService}>
                        <ExtensionProvider checkoutService={checkoutService}>
                            <OrderSummary
                                {...mapToOrderSummarySubtotalsProps(order, false)}
                                headerLink={<PrintLink />}
                                lineItems={order.lineItems}
                                shopperCurrency={getStoreConfig().shopperCurrency}
                                storeCurrency={getStoreConfig().currency}
                                total={order.orderAmount}
                            />
                        </ExtensionProvider>
                    </LocaleProvider>
                </CheckoutProvider>,
            );

            expect(screen.getByText('Order Summary')).toBeInTheDocument();
            expect(screen.getByText('2 Items')).toBeInTheDocument();

            const shippingCostInOrderSummary = screen.getByTestId('cart-shipping');

            expect(shippingCostInOrderSummary).toHaveTextContent('Shipping');
            expect(shippingCostInOrderSummary).toHaveTextContent('20');
            expect(shippingCostInOrderSummary).not.toHaveTextContent('15');

            const couponDetailInOrderSummary = screen.getByTestId('cart-coupon');

            expect(couponDetailInOrderSummary).toHaveTextContent('279F507D817E3E7');
            expect(couponDetailInOrderSummary).toHaveTextContent('3');
        });
    });
});
