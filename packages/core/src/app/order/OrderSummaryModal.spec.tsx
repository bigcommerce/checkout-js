import { Order } from '@bigcommerce/checkout-sdk';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import { getStoreConfig } from '../config/config.mock';

import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import { getOrder } from './orders.mock';
import OrderSummaryModal from './OrderSummaryModal';

let order: Order;
let orderSummary: ShallowWrapper;

describe('OrderSummaryModal', () => {
    beforeEach(() => {
        order = getOrder();

        orderSummary = shallow(
            <OrderSummaryModal
                isOpen={true}
                {...mapToOrderSummarySubtotalsProps(order)}
                additionalLineItems="foo"
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
});
