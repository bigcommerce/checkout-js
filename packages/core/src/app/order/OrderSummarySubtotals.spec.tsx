import { shallow } from 'enzyme';
import React from 'react';

import { mapFromPayments } from '../giftCertificate';

import { getOrder } from './orders.mock';
import OrderSummarySubtotals from './OrderSummarySubtotals';

describe('OrderSummarySubtotals', () => {
    let orderSummarySubtotals: any;

    beforeEach(() => {
        const order = getOrder();

        orderSummarySubtotals = shallow(
            <OrderSummarySubtotals
                coupons={order.coupons}
                discountAmount={order.discountAmount}
                giftCertificates={order.payments && mapFromPayments(order.payments)}
                handlingAmount={order.handlingCostTotal}
                shippingAmount={order.shippingCostTotal}
                subtotalAmount={order.orderAmount}
                taxes={order.taxes}
            />,
        );
    });

    it('renders component', () => {
        expect(orderSummarySubtotals).toMatchSnapshot();
    });


    describe('Tax summary is not rendered if tax is inclusive', () => {
        it('Renders component without tax summary', () => {
            const order = { ...getOrder(), isTaxIncluded: true };

            orderSummarySubtotals = shallow(
                <OrderSummarySubtotals
                    coupons={order.coupons}
                    discountAmount={order.discountAmount}
                    giftCertificates={order.payments && mapFromPayments(order.payments)}
                    handlingAmount={order.handlingCostTotal}
                    shippingAmount={order.shippingCostTotal}
                    subtotalAmount={order.orderAmount}
                    taxes={order.taxes}
                />,
            );

            expect(orderSummarySubtotals).toMatchSnapshot();
        });
    })
});
