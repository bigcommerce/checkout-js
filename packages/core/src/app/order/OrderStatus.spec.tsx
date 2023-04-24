import { CheckoutService, createCheckoutService, Order } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { LocaleProvider, TranslatedHtml } from '@bigcommerce/checkout/locale';

import { getOrder, getOrderWithMandateId, getOrderWithMandateURL } from './orders.mock';
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

        OrderStatusTest = (props) => (
            <LocaleProvider checkoutService={checkoutService}>
                <OrderStatus {...props} />
            </LocaleProvider>
        );
    });

    describe('when order is complete', () => {
        it('renders confirmation message with contact email and phone number if both are provided', () => {
            const orderStatus = mount(
                <OrderStatusTest {...defaultProps} supportPhoneNumber="990" />,
            );
            const translationProps = orderStatus
                .find('[data-test="order-confirmation-order-status-text"]')
                .find(TranslatedHtml)
                .props();

            expect(translationProps).toEqual({
                data: {
                    orderNumber: defaultProps.order.orderId,
                    supportEmail: defaultProps.supportEmail,
                    supportPhoneNumber: '990',
                },
                id: 'order_confirmation.order_with_support_number_text',
            });
        });

        it('renders confirmation message without contact phone number if it is not provided', () => {
            const orderStatus = mount(<OrderStatusTest {...defaultProps} />);
            const translationProps = orderStatus
                .find('[data-test="order-confirmation-order-status-text"]')
                .find(TranslatedHtml)
                .props();

            expect(translationProps).toEqual({
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
            const orderStatus = mount(<OrderStatusTest {...defaultProps} order={order} />);
            const translationProps = orderStatus
                .find('[data-test="order-confirmation-order-status-text"]')
                .find(TranslatedHtml)
                .props();

            expect(translationProps).toEqual({
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
            const orderStatus = mount(<OrderStatusTest {...defaultProps} order={order} />);
            const translationProps = orderStatus
                .find('[data-test="order-confirmation-order-status-text"]')
                .find(TranslatedHtml)
                .props();

            expect(translationProps).toEqual({
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
            const orderStatus = mount(<OrderStatusTest {...defaultProps} order={order} />);
            const translationProps = orderStatus
                .find('[data-test="order-confirmation-order-status-text"]')
                .find(TranslatedHtml)
                .props();

            expect(translationProps).toEqual({
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
            const orderStatus = mount(<OrderStatusTest {...defaultProps} order={order} />);
            const translationProps = orderStatus
                .find('[data-test="order-confirmation-order-status-text"]')
                .find(TranslatedHtml)
                .props();

            expect(translationProps).toEqual({
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
                <OrderStatusTest {...defaultProps} order={{ ...order, isDownloadable: true }} />,
            );
            const translationProps = orderStatus
                .find('[data-test="order-confirmation-digital-items-text"]')
                .find(TranslatedHtml)
                .props();

            expect(translationProps).toEqual({
                id: 'order_confirmation.order_with_downloadable_digital_items_text',
            });
        });

        it('renders status without downloadable items text if order it not yet downloadable', () => {
            const orderStatus = mount(
                <OrderStatusTest {...defaultProps} order={{ ...order, isDownloadable: false }} />,
            );
            const translationProps = orderStatus
                .find('[data-test="order-confirmation-digital-items-text"]')
                .find(TranslatedHtml)
                .props();

            expect(translationProps).toEqual({
                id: 'order_confirmation.order_without_downloadable_digital_items_text',
            });
        });
    });

    describe('when order has mandate', () => {
        beforeEach(() => {
            order = getOrderWithMandateURL();
        });

        it('renders mandate link if it is provided', () => {
            const orderStatus = mount(<OrderStatusTest {...defaultProps} order={order} />);

            expect(
                orderStatus.find('[data-test="order-confirmation-mandate-link-text"]').prop('href'),
            ).toBe('https://www.test.com/mandate');
            expect(
                orderStatus.find('[data-test="order-confirmation-mandate-id-text"]'),
            ).toHaveLength(0);
        });

        it('renders mandate id if it is provided', () => {
            order = getOrderWithMandateId();

            const orderStatus = mount(<OrderStatusTest {...defaultProps} order={order} />);

            expect(
                orderStatus.find('[data-test="order-confirmation-mandate-link-text"]'),
            ).toHaveLength(0);
            expect(
                orderStatus.find('[data-test="order-confirmation-mandate-id-text"]'),
            ).toHaveLength(1);
        });

        it('renders "SEPA Direct Debit Mandate" text on mandate link when provider description is Stripe (SEPA)', () => {
            const orderStatus = mount(
                <OrderStatusTest
                    {...defaultProps}
                    order={{
                        ...order,
                        payments: [
                            {
                                providerId: 'stripev3',
                                methodId: 'iban',
                                description: 'Stripe (SEPA)',
                                amount: 190,
                                detail: {
                                    step: 'FINALIZE',
                                    instructions: '<strong>295</strong> something',
                                },
                                mandate: {
                                    id: '',
                                    url: 'https://www.test.com/mandate',
                                },
                            },
                        ],
                    }}
                />,
            );

            expect(
                orderStatus.find('[data-test="order-confirmation-mandate-link-text"]').text(),
            ).toBe('SEPA Direct Debit Mandate');
        });

        it('renders "SEPA Direct Debit Mandate" text when provider description is Checkout.com', () => {
            const orderStatus = mount(
                <OrderStatusTest
                    {...defaultProps}
                    order={{
                        ...order,
                        payments: [
                            {
                                providerId: 'checkoutcom',
                                methodId: 'sepa',
                                description: 'SEPA Direct Debit (via Checkout.com)',
                                amount: 190,
                                detail: {
                                    step: 'FINALIZE',
                                    instructions: '<strong>295</strong> something',
                                },
                                mandate: {
                                    id: 'ABC123',
                                    url: '',
                                },
                            },
                        ],
                    }}
                />,
            );

            expect(
                orderStatus.find('[data-test="order-confirmation-mandate-id-text"]').text(),
            ).toBe('SEPA Direct Debit (via Checkout.com) Mandate Reference: ABC123');
        });

        it('does not render mandate id or url if it is not provided', () => {
            const orderStatus = mount(
                <OrderStatusTest
                    {...defaultProps}
                    order={{
                        ...order,
                        payments: [
                            {
                                providerId: 'stripev3',
                                methodId: 'iban',
                                description: 'Stripe (SEPA)',
                                amount: 190,
                                detail: {
                                    step: 'FINALIZE',
                                    instructions: '<strong>295</strong> something',
                                },
                                mandate: {
                                    id: '',
                                    url: '',
                                },
                            },
                        ],
                    }}
                />,
            );

            expect(
                orderStatus.find('[data-test="order-confirmation-mandate-link-text"]'),
            ).toHaveLength(0);
            expect(
                orderStatus.find('[data-test="order-confirmation-mandate-id-text"]'),
            ).toHaveLength(0);
        });
    });
});
