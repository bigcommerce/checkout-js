import { Order } from '@bigcommerce/checkout-sdk';
import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import { getOrder } from './orders.mock';
import OrderStatus from './OrderStatus';

let order: Order;
let orderStatus: ShallowWrapper;

describe('OrderStatus', () => {
    describe('when order is not waiting manual verification', () => {

        beforeEach(() => {
            order = getOrder();
        });

        describe('and has support data', () => {
            beforeEach(() => {
                orderStatus = shallow(<OrderStatus
                    order={ order }
                    supportPhoneNumber="990"
                    supportEmail="test@example.com"
                />);
            });

            it('renders status with contact information', () => {
                expect(orderStatus).toMatchSnapshot();
            });
        });

        describe('and has no support data', () => {
            beforeEach(() => {
                orderStatus = shallow(<OrderStatus
                    order={ order }
                />);
            });

            it('renders status', () => {
                expect(orderStatus).toMatchSnapshot();
            });
        });
    });

    describe('when order is waiting manual verification', () => {
        beforeEach(() => {
            orderStatus = shallow(<OrderStatus
                order={ {
                    ...getOrder(),
                    status: 'MANUAL_VERIFICATION_REQUIRED',
                } }
            />);
        });

        it('renders status with special text', () => {
            expect(orderStatus).toMatchSnapshot();
        });
    });

    describe('when order has digital items', () => {
        beforeEach(() => {
            order = {
                ...getOrder(),
                hasDigitalItems: true,
            };
        });

        describe('and has downloadable items', () => {
            beforeEach(() => {
                order.isDownloadable = true;
            });

            it('renders status with downloadable items text', () => {
                expect(shallow(<OrderStatus order={ order }/>)).toMatchSnapshot();
            });
        });

        describe('and does not have downloadable items', () => {
            beforeEach(() => {
                order.isDownloadable = false;
            });

            it('renders status without downloadable items text', () => {
                expect(shallow(<OrderStatus order={ order }/>)).toMatchSnapshot();
            });
        });
    });
});
