import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import OrderSummaryItem from './OrderSummaryItem';

describe('OrderSummaryItems', () => {
    let orderSummaryItem: ShallowWrapper;

    describe('when amount and amountAfterDiscount are different', () => {
        beforeEach(() => {
            orderSummaryItem = shallow(
                <OrderSummaryItem
                    amount={10}
                    amountAfterDiscount={8}
                    id="foo"
                    image={<img />}
                    name="Product"
                    productOptions={[
                        {
                            testId: 'test-id',
                            content: <span />,
                        },
                    ]}
                    quantity={2}
                />,
            );
        });

        it('renders component', () => {
            expect(orderSummaryItem).toMatchSnapshot();
        });
    });

    describe('when no discount is present', () => {
        beforeEach(() => {
            orderSummaryItem = shallow(
                <OrderSummaryItem amount={10} id="foo" name="Product" quantity={2} />,
            );
        });

        it('does not render discount', () => {
            expect(
                orderSummaryItem.find('[data-test="cart-item-product-price--afterDiscount"]'),
            ).toHaveLength(0);
        });

        it('does not apply strike to original amount', () => {
            expect(
                orderSummaryItem.find('[data-test="cart-item-product-price"]').props().className,
            ).not.toContain('product-price--beforeDiscount');
        });
    });

    describe('when amount and amountAfterDiscount are the same', () => {
        beforeEach(() => {
            orderSummaryItem = shallow(
                <OrderSummaryItem
                    amount={10}
                    amountAfterDiscount={10}
                    id="foo"
                    name="Product"
                    quantity={2}
                />,
            );
        });

        it('does not render discount', () => {
            expect(
                orderSummaryItem.find('[data-test="cart-item-product-price--afterDiscount"]'),
            ).toHaveLength(0);
        });

        it('does not apply strike to original amount', () => {
            expect(
                orderSummaryItem.find('[data-test="cart-item-product-price"]').props().className,
            ).not.toContain('product-price--beforeDiscount');
        });
    });

    describe('when description is present', () => {
        beforeEach(() => {
            orderSummaryItem = shallow(
                <OrderSummaryItem
                    amount={10}
                    description="Description"
                    id="foo"
                    name="Product"
                    quantity={2}
                />,
            );
        });

        it('does render description', () => {
            expect(
                orderSummaryItem.find('[data-test="cart-item-product-description"]').text(),
            ).toBe('Description');
        });
    });
});
