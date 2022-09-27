import { Order } from '@bigcommerce/checkout-sdk';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import { getStoreConfig } from '../config/config.mock';

import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import { getOrder } from './orders.mock';
import OrderSummary from './OrderSummary';
import PrintLink from './PrintLink';

let order: Order;
let orderSummary: ShallowWrapper;

describe('OrderSummary', () => {
    describe('when shopper has same currency as store', () => {
        beforeEach(() => {
            order = getOrder();

            orderSummary = shallow(
                <OrderSummary
                    {...mapToOrderSummarySubtotalsProps(order)}
                    headerLink={<PrintLink />}
                    lineItems={order.lineItems}
                    shopperCurrency={getStoreConfig().shopperCurrency}
                    storeCurrency={getStoreConfig().currency}
                    total={order.orderAmount}
                />,
            );
        });

        it('renders order summary', () => {
            expect(orderSummary).toMatchSnapshot();
        });

        it('does not render currency cart note', () => {
            expect(orderSummary.find('.cart-note')).toHaveLength(0);
        });
    });
});
