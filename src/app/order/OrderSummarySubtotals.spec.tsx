import { shallow } from 'enzyme';
import React from 'react';

import { mapFromPayments } from '../giftCertificate';

import { getOrder } from './orders.mock';
import OrderSummarySubtotals from './OrderSummarySubtotals';

describe('OrderSummarySubtotals', () => {
    let orderSummarySubtotals: any;

    beforeEach(() => {
        const order = getOrder();

        orderSummarySubtotals = shallow(<OrderSummarySubtotals
            coupons={ order.coupons }
            giftCertificates={ order.payments && mapFromPayments(order.payments) }
            discountAmount={ order.discountAmount }
            taxes={ order.taxes }
            shippingAmount={ order.shippingCostTotal }
            handlingAmount={ order.handlingCostTotal }
            subtotalAmount={ order.orderAmount }
        />);
    });

    it('renders component', () => {
        expect(orderSummarySubtotals).toMatchSnapshot();
    });
});
