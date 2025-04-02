import { createCheckoutService, Order } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import { getOrder } from './orders.mock';
import OrderSummary, { OrderSummaryProps } from './OrderSummary';
import { OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
import PrintLink from './PrintLink';

let order: Order;
let OrderSummaryTest: FunctionComponent<OrderSummaryProps & OrderSummarySubtotalsProps>;

jest.mock('./OrderSummaryPrice', () => (props: any) => <span {...props} />);

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
                                {...mapToOrderSummarySubtotalsProps(order)}
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
                                {...mapToOrderSummarySubtotalsProps(taxIncludedOrder)}
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
});
