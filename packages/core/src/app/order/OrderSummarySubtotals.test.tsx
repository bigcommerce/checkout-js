import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { mapFromPayments } from '../giftCertificate';

import { getOrder } from './orders.mock';
import OrderSummarySubtotals from './OrderSummarySubtotals';

describe('OrderSummarySubtotals', () => {
    const storeConfig = getStoreConfig();
    const contextValue = createLocaleContext({
        ...storeConfig,
        shopperCurrency: {
            ...storeConfig.shopperCurrency,
            exchangeRate: 1,
        },
    });

    it('renders component', () => {
        const order = getOrder();

        render(
            <LocaleContext.Provider value={contextValue}>
                <OrderSummarySubtotals
                    coupons={order.coupons}
                    discountAmount={order.discountAmount}
                    giftCertificates={order.payments && mapFromPayments(order.payments)}
                    handlingAmount={order.handlingCostTotal}
                    shippingAmount={order.shippingCostTotal}
                    subtotalAmount={order.orderAmount}
                    taxes={order.taxes}
                />
            </LocaleContext.Provider>,
        );

        expect(screen.getByTestId('cart-taxes')).toHaveTextContent('Tax');
        expect(screen.getByTestId('cart-taxes')).toHaveTextContent('$3.00');

        expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('Subtotal');
        expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('$190.00');

        expect(screen.getByTestId('cart-shipping')).toHaveTextContent('Shipping');
        expect(screen.getByTestId('cart-shipping')).toHaveTextContent('$15.00');

        expect(screen.getByTestId('cart-handling')).toHaveTextContent('Handling');
        expect(screen.getByTestId('cart-handling')).toHaveTextContent('$8.00');

        expect(screen.getByTestId('cart-discount')).toHaveTextContent('Discount');
        expect(screen.getByTestId('cart-discount')).toHaveTextContent('-$10.00');

        expect(screen.getByTestId('cart-gift-certificate')).toHaveTextContent('Gift Certificate');
        expect(screen.getByTestId('cart-gift-certificate')).toHaveTextContent('-$7.00');

        const couponElements = screen.getAllByTestId('cart-coupon');
        const [firstCouponElement, secondCouponElement] = couponElements;

        expect(couponElements).toHaveLength(2);
        expect(firstCouponElement).toHaveTextContent('-$5.00');
        expect(firstCouponElement).toHaveTextContent('20% off each item');
        expect(firstCouponElement).toHaveTextContent('savebig2015');
        expect(secondCouponElement).toHaveTextContent('-$5.00');
        expect(secondCouponElement).toHaveTextContent('$5.00 off the shipping total');
        expect(secondCouponElement).toHaveTextContent('279F507D817E3E7');
    });

    describe('Tax summary is not rendered if tax is inclusive', () => {
        it('renders component without tax summary', () => {
            const order = { ...getOrder(), isTaxIncluded: true };

            render(
                <LocaleContext.Provider value={contextValue}>
                    <OrderSummarySubtotals
                        coupons={order.coupons}
                        isTaxIncluded={order.isTaxIncluded}
                        subtotalAmount={order.orderAmount}
                        taxes={order.taxes}
                    />
                </LocaleContext.Provider>,
            );

            expect(screen.queryByTestId('cart-taxes')).not.toBeInTheDocument();
        });
    });

    describe('Custom fee', () => {
        it('renders component without custom fee', () => {
            const order = { ...getOrder(), fees: [] };

            render(
                <LocaleContext.Provider value={contextValue}>
                    <OrderSummarySubtotals
                        coupons={order.coupons}
                        fees={order.fees}
                        subtotalAmount={order.orderAmount}
                    />
                </LocaleContext.Provider>,
            );

            expect(screen.queryByTestId('cart-fees')).not.toBeInTheDocument();
        });

        it('renders component with custom fee', () => {
            const order = {
                ...getOrder(),
                fees: [
                    {
                        id: '803f6aff-9c05-4173-82f5-7a851797fd80',
                        type: 'custom_fee',
                        name: 'test name 2',
                        displayName: 'test display name 2',
                        cost: 20.46,
                        source: 'test source 2',
                    },
                    {
                        id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
                        type: 'custom_fee',
                        name: 'test name 3',
                        displayName: 'test display name 3',
                        cost: 30.48,
                        source: 'test source 3',
                    },
                ],
            };

            render(
                <LocaleContext.Provider value={contextValue}>
                    <OrderSummarySubtotals
                        coupons={order.coupons}
                        fees={order.fees}
                        subtotalAmount={order.orderAmount}
                    />
                </LocaleContext.Provider>,
            );

            const feeElements = screen.getAllByTestId('cart-fees');
            const [firstFeeElement, secondFeeElement] = feeElements;

            expect(feeElements).toHaveLength(2);
            expect(firstFeeElement).toHaveTextContent('test display name 2');
            expect(firstFeeElement).toHaveTextContent('$20.46');
            expect(secondFeeElement).toHaveTextContent('test display name 3');
            expect(secondFeeElement).toHaveTextContent('$30.48');
        });
    });
});
