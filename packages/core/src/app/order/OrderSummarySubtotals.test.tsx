import { render, screen } from '@testing-library/react';
import React from 'react';

import { mapFromPayments } from '../giftCertificate';

import { getOrder } from './orders.mock';
import OrderSummarySubtotals from './OrderSummarySubtotals';

describe('OrderSummarySubtotals', () => {
    it('renders component', () => {
        const order = getOrder();

        render(
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

        expect(screen.getByText('Tax')).toBeInTheDocument();
        expect(screen.getByText('20% off each item')).toBeInTheDocument();
        expect(screen.getByText('savebig2015')).toBeInTheDocument();
        expect(screen.getByText('$5.00 off the shipping total')).toBeInTheDocument();
        expect(screen.getByText('279F507D817E3E7')).toBeInTheDocument();
        expect(screen.getByTestId('cart-subtotal')).toBeInTheDocument();
        expect(screen.getByTestId('cart-shipping')).toBeInTheDocument();
        expect(screen.getByTestId('cart-handling')).toBeInTheDocument();
        expect(screen.getByTestId('cart-taxes')).toBeInTheDocument();
        expect(screen.getByTestId('cart-discount')).toBeInTheDocument();
        expect(screen.getByTestId('cart-gift-certificate')).toBeInTheDocument();
        expect(screen.getAllByTestId('cart-coupon')).toHaveLength(2);
        expect(screen.queryByTestId('cart-gift-wrapping')).not.toBeInTheDocument();
        expect(screen.queryByTestId('cart-store-credit')).not.toBeInTheDocument();
    });

    describe('Tax summary is not rendered if tax is inclusive', () => {
        it('Renders component without tax summary', () => {
            const order = { ...getOrder(), isTaxIncluded: true };

            render(
                <OrderSummarySubtotals
                    coupons={order.coupons}
                    isTaxIncluded={order.isTaxIncluded}
                    subtotalAmount={order.orderAmount}
                    taxes={order.taxes}
                />,
            );

            expect(screen.queryByTestId('cart-taxes')).not.toBeInTheDocument();
        });
    })

    describe('Custom fee', () => {
        it('Render component without custom fee', () => {
            const order = { ...getOrder(), fees: [] };

            render(
                <OrderSummarySubtotals
                    coupons={order.coupons}
                    fees={order.fees}
                    subtotalAmount={order.orderAmount}
                />,
            );

            expect(screen.queryByTestId('cart-fees')).not.toBeInTheDocument();
        });

        it('Renders component with custom fee', () => {
            const order = { ...getOrder(), fees: [
                { 
                    id: '803f6aff-9c05-4173-82f5-7a851797fd80',
                    type: 'custom_fee',
                    name: 'test name 2',
                    displayName: 'test display name 2',
                    cost: 20,
                    source: 'test source 2',
                 },
                 {
                    id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
                    type: 'custom_fee',
                    name: 'test name 3',
                    displayName: 'test display name 3',
                    cost: 30,
                    source: 'test source 3',
                 }
                ]
            };

            render(
                <OrderSummarySubtotals
                    coupons={order.coupons}
                    fees={order.fees}
                    subtotalAmount={order.orderAmount}
                />,
            );

            expect(screen.getAllByTestId('cart-fees')).toHaveLength(2);
            expect(screen.getByText('test display name 2')).toBeInTheDocument();
            expect(screen.getByText('test display name 3')).toBeInTheDocument();
        });
    })
});
