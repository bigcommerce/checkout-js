import { createCheckoutService, CheckoutService, Order } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { LocaleProvider, TranslatedHtml, TranslatedString } from '../locale';

import { getOrder } from './orders.mock';
import OrderStatus, { OrderStatusProps } from './OrderStatus';

describe('OrderStatus', () => {
    let checkoutService: CheckoutService;
    let defaultProps: OrderStatusProps;
    let order: Order;
    let OrderStatusTest: FunctionComponent<OrderStatusProps>;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        order = getOrder();

        defaultProps = {
            order,
            supportEmail: 'test@example.com',
        };

        OrderStatusTest = props => (
            <LocaleProvider checkoutService={ checkoutService }>
                <OrderStatus { ...props } />
            </LocaleProvider>
        );
    });

    describe('when order is complete', () => {
        it('renders confirmation message with contact email and phone number if both are provided', () => {
            const orderStatus = mount(
                <OrderStatusTest
                    { ...defaultProps }
                    supportPhoneNumber="990"
                />
            );
            const translationProps = orderStatus.find('[data-test="order-confirmation-order-status-text"]')
                .find(TranslatedHtml)
                .props();

            expect(translationProps)
                .toEqual({
                    data: {
                        orderNumber: defaultProps.order.orderId,
                        supportEmail: defaultProps.supportEmail,
                        supportPhoneNumber: '990',
                    },
                    id: 'order_confirmation.order_with_support_number_text',
                });
        });

        it('renders confirmation message without contact phone number if it is not provided', () => {
            const orderStatus = mount(
                <OrderStatusTest
                    { ...defaultProps }
                />
            );
            const translationProps = orderStatus.find('[data-test="order-confirmation-order-status-text"]')
                .find(TranslatedHtml)
                .props();

            expect(translationProps)
                .toEqual({
                    data: {
                        orderNumber: defaultProps.order.orderId,
                        supportEmail: defaultProps.supportEmail,
                    },
                    id: 'order_confirmation.order_without_support_number_text',
                });
        });
    });

    describe('when order requires manual verification', () => {
        beforeEach(() => {
            order = {
                ...getOrder(),
                status: 'MANUAL_VERIFICATION_REQUIRED',
            };
        });

        it('renders message indicating order is pending review', () => {
            const orderStatus = mount(
                <OrderStatusTest
                    { ...defaultProps }
                    order={ order }
                />
            );
            const translationProps = orderStatus.find('[data-test="order-confirmation-order-status-text"]')
                .find(TranslatedString)
                .props();

            expect(translationProps)
                .toEqual({
                    id: 'order_confirmation.order_pending_review_text',
                });
        });
    });

    describe('when order is awaiting payment', () => {
        beforeEach(() => {
            order = {
                ...getOrder(),
                status: 'AWAITING_PAYMENT',
            };
        });

        it('renders message indicating order is awaiting payment', () => {
            const orderStatus = mount(
                <OrderStatusTest
                    { ...defaultProps }
                    order={ order }
                />
            );
            const translationProps = orderStatus.find('[data-test="order-confirmation-order-status-text"]')
                .find(TranslatedString)
                .props();

            expect(translationProps)
                .toEqual({
                    id: 'order_confirmation.order_pending_review_text',
                });
        });
    });

    describe('when order is pending', () => {
        beforeEach(() => {
            order = {
                ...getOrder(),
                status: 'PENDING',
            };
        });

        it('renders message indicating order is pending', () => {
            const orderStatus = mount(
                <OrderStatusTest
                    { ...defaultProps }
                    order={ order }
                />
            );
            const translationProps = orderStatus.find('[data-test="order-confirmation-order-status-text"]')
                .find(TranslatedString)
                .props();

            expect(translationProps)
                .toEqual({
                    data: {
                        orderNumber: defaultProps.order.orderId,
                        supportEmail: defaultProps.supportEmail,
                    },
                    id: 'order_confirmation.order_pending_status_text',
                });
        });
    });

    describe('when order is incomplete', () => {
        beforeEach(() => {
            order = {
                ...getOrder(),
                status: 'INCOMPLETE',
            };
        });

        it('renders message indicating order is incomplete', () => {
            const orderStatus = mount(
                <OrderStatusTest
                    { ...defaultProps }
                    order={ order }
                />
            );
            const translationProps = orderStatus.find('[data-test="order-confirmation-order-status-text"]')
                .find(TranslatedString)
                .props();

            expect(translationProps)
                .toEqual({
                    data: {
                        orderNumber: defaultProps.order.orderId,
                        supportEmail: defaultProps.supportEmail,
                    },
                    id: 'order_confirmation.order_incomplete_status_text',
                });
        });
    });

    describe('when order has digital items', () => {
        beforeEach(() => {
            order = {
                ...getOrder(),
                hasDigitalItems: true,
            };
        });

        it('renders status with downloadable items text if order is downloadable', () => {
            const orderStatus = mount(
                <OrderStatusTest
                    { ...defaultProps }
                    order={ { ...order, isDownloadable: true } }
                />
            );
            const translationProps = orderStatus.find('[data-test="order-confirmation-digital-items-text"]')
                .find(TranslatedHtml)
                .props();

            expect(translationProps)
                .toEqual({
                    id: 'order_confirmation.order_with_downloadable_digital_items_text',
                });
        });

        it('renders status without downloadable items text if order it not yet downloadable', () => {
            const orderStatus = mount(
                <OrderStatusTest
                    { ...defaultProps }
                    order={ { ...order, isDownloadable: false } }
                />
            );
            const translationProps = orderStatus.find('[data-test="order-confirmation-digital-items-text"]')
                .find(TranslatedHtml)
                .props();

            expect(translationProps)
                .toEqual({
                    id: 'order_confirmation.order_without_downloadable_digital_items_text',
                });
        });
    });
});
