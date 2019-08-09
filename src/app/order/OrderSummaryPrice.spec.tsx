import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import { ShopperCurrency } from '../currency';

import OrderSummaryPrice from './OrderSummaryPrice';

describe('OrderSummaryPrice', () => {
    let orderSummaryPrice: ShallowWrapper;

    describe('when has non-zero amount', () => {
        const amount = 10;

        describe('and has only required props', () => {
            beforeEach(() => {
                orderSummaryPrice = shallow(<OrderSummaryPrice
                    label="Label"
                    amount={ amount }
                >
                    Foo Children
                </OrderSummaryPrice>);
            });

            it('renders component', () => {
                expect(orderSummaryPrice).toMatchSnapshot();
            });
        });

        describe('and has only required props', () => {
            beforeEach(() => {
                orderSummaryPrice = shallow(<OrderSummaryPrice
                    label="Label"
                    amount={ amount }
                    testId="test-id"
                    className="extra-class"
                    currencyCode="EUR"
                    superscript="*"
                />);
            });

            it('renders additional elements/props', () => {
                expect(orderSummaryPrice.first().props())
                    .toMatchObject({
                        'data-test': 'test-id',
                    });

                expect(orderSummaryPrice.find('.cart-priceItem').props().className)
                    .toContain('extra-class');

                expect(orderSummaryPrice.find('.cart-priceItem-currencyCode').text())
                    .toMatch('(EUR)');

                expect(orderSummaryPrice.find('[data-test="cart-price-value-superscript"]').text())
                    .toMatch('*');
            });
        });
    });

    describe('when has null amount', () => {
        beforeEach(() => {
            orderSummaryPrice = shallow(<OrderSummaryPrice
                label="Label"
                amount={ null }
            />);
        });

        it('renders not yet symbol as label', () => {
            expect(orderSummaryPrice.find('[data-test="cart-price-value"]').text())
                .toEqual('--');
        });
    });

    describe('when has zero amount', () => {
        const amount = 0;

        describe('and no label', () => {
            beforeEach(() => {
                orderSummaryPrice = shallow(<OrderSummaryPrice
                    label="Label"
                    amount={ amount }
                    className="label"
                    testId="test"
                />);
            });

            it('renders formatted amount', () => {
                expect(orderSummaryPrice.find(ShopperCurrency).props())
                    .toMatchObject({ amount: 0 });
            });
        });

        describe('and zero label', () => {
            beforeEach(() => {
                orderSummaryPrice = shallow(<OrderSummaryPrice
                    label="Label"
                    amount={ amount }
                    zeroLabel="Free"
                    className="label"
                    testId="test"
                />);
            });

            it('renders zero label', () => {
                expect(orderSummaryPrice.find('[data-test="cart-price-value"]').text())
                    .toEqual('Free');
            });
        });
    });
});
