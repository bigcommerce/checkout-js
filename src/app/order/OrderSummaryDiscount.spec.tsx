import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import { ShopperCurrency } from '../currency';

import OrderSummaryDiscount from './OrderSummaryDiscount';
import OrderSummaryPrice from './OrderSummaryPrice';

describe('OrderSummaryDiscount', () => {
    let discount: ShallowWrapper;

    describe('when it is a simple discount', () => {
        beforeEach(() => {
            discount = shallow(<OrderSummaryDiscount
                amount={ 10 }
                label={ <span>Foo</span> }
            />);
        });

        it('passes right props to OrderSummaryPrice', () => {
            expect(discount.find(OrderSummaryPrice).props())
                .toMatchObject({
                    amount: -10,
                    label: <span>Foo</span>,
                });
        });
    });

    describe('when discount has code and remaining balance', () => {
        beforeEach(() => {
            discount = shallow(<OrderSummaryDiscount
                amount={ 10 }
                code="ABCDFE"
                label="Gift Certificate"
                remaining={ 2 }
            />);
        });

        it('renders gift certificate code', () => {
            expect(discount.find('[data-test="cart-price-code"]').text())
                .toEqual('ABCDFE');
        });

        it('renders remaining label', () => {
            expect(discount.find('[data-test="cart-price-remaining"]').text())
                .toContain('Remaining:');
        });

        it('renders remaining balance', () => {
            expect(discount.find(ShopperCurrency).props())
                .toMatchObject({ amount: 2 });
        });
    });
});
