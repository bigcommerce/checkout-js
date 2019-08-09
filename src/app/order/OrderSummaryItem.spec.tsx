import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import OrderSummaryItem from './OrderSummaryItem';

describe('OrderSummaryItems', () => {
    let orderSummaryItem: ShallowWrapper;

    describe('when amount and amountAfterDiscount are different', () => {
        beforeEach(() => {
            orderSummaryItem = shallow(<OrderSummaryItem
                id="foo"
                name="Product"
                quantity={ 2 }
                amount={ 10 }
                amountAfterDiscount={ 8 }
                image={ <img /> }
                productOptions={ [{
                    testId: 'test-id',
                    content: <span />,
                }] }
            />);
        });

        it('renders component', () => {
            expect(orderSummaryItem).toMatchSnapshot();
        });
    });

    describe('when no discount is present', () => {
        beforeEach(() => {
            orderSummaryItem = shallow(<OrderSummaryItem
                id="foo"
                name="Product"
                quantity={ 2 }
                amount={ 10 }
            />);
        });

        it('does not render discount', () => {
            expect(orderSummaryItem.find('[data-test="cart-item-product-price--afterDiscount"]').length)
                .toEqual(0);
        });

        it('does not apply strike to original amount', () => {
            expect(orderSummaryItem.find('[data-test="cart-item-product-price"]').props().className)
                .not.toContain('product-price--beforeDiscount');
        });
    });

    describe('when amount and amountAfterDiscount are the same', () => {
        beforeEach(() => {
            orderSummaryItem = shallow(<OrderSummaryItem
                id="foo"
                name="Product"
                quantity={ 2 }
                amount={ 10 }
                amountAfterDiscount={ 10 }
            />);
        });

        it('does not render discount', () => {
            expect(orderSummaryItem.find('[data-test="cart-item-product-price--afterDiscount"]').length)
                .toEqual(0);
        });

        it('does not apply strike to original amount', () => {
            expect(orderSummaryItem.find('[data-test="cart-item-product-price"]').props().className)
                .not.toContain('product-price--beforeDiscount');
        });
    });
});
