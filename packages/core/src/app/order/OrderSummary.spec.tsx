import { createCheckoutService, Order } from '@bigcommerce/checkout-sdk';
import { mount, ShallowWrapper } from 'enzyme';
import React from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../config/config.mock';

import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import { getOrder } from './orders.mock';
import OrderSummary from './OrderSummary';
import PrintLink from './PrintLink';

let order: Order;
let orderSummary: ShallowWrapper;

jest.mock('./OrderSummaryPrice', () => (props: any) => <span {...props} />);

describe('OrderSummary', () => {
    const checkoutService = createCheckoutService();

    describe('when shopper has same currency as store', () => {
        beforeEach(() => {
            order = getOrder();

            orderSummary = mount(
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
                </CheckoutProvider>,
            );
        });

        it('renders order summary', () => {
            expect(orderSummary.html()).toMatchSnapshot();
        });

        it('does not render currency cart note', () => {
            expect(orderSummary.find('.cart-note')).toHaveLength(0);
        });
    });

    describe('when taxes are inclusive', () => {
        it('displays tax as summary section', () => {
            const taxIncludedOrder = {
                ...getOrder(),
                isTaxIncluded: true,
            };

            orderSummary = mount(
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

            expect(orderSummary.html()).toMatchSnapshot();

            expect(orderSummary.find('.cart-taxItem')).toHaveLength(1);
        });
    });
});
