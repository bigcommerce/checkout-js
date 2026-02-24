import { type CheckoutService, createCheckoutService, type Order } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/contexts';
import { getLanguageService } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getOrder, getOrderWithMandateId, getOrderWithMandateURL } from './orders.mock';
import OrderStatus, { type OrderStatusProps } from './OrderStatus';

const getTextContent = (markup: string) => {
    return new DOMParser()
        .parseFromString(markup, "text/html")
        .body
        .textContent;
}

describe('OrderStatus', () => {
    let checkoutService: CheckoutService;
    let defaultProps: OrderStatusProps;
    let order: Order;
    let OrderStatusTest: FunctionComponent<OrderStatusProps>;

    const languageService = getLanguageService();

    beforeEach(() => {
        checkoutService = createCheckoutService();
        order = getOrder();

        defaultProps = {
            order,
            supportEmail: 'test@example.com',
        };

        OrderStatusTest = (props) => (
            <LocaleProvider
                checkoutService={checkoutService}
                languageService={getLanguageService()}
            >
                <OrderStatus {...props} />
            </LocaleProvider>
        );
    });

    describe('when order is complete', () => {
        it('renders confirmation message with contact email and phone number if both are provided', () => {
            const supportPhoneNumber = "990";

            render(
                <OrderStatusTest {...defaultProps} supportPhoneNumber={supportPhoneNumber} />,
            );

            expect(screen.getByTestId('order-confirmation-order-number-text')).toHaveTextContent(`Your order number is ${order.orderId}`);
            expect(screen.getByTestId('order-confirmation-order-status-text'))
                .toHaveTextContent(getTextContent(languageService.translate('order_confirmation.order_with_support_number_text', {
                    orderNumber: defaultProps.order.orderId,
                    supportEmail: defaultProps.supportEmail,
                    supportPhoneNumber,
                })));
        });

        it('renders confirmation message without contact phone number if it is not provided', () => {
            render(<OrderStatusTest {...defaultProps} />);

            expect(screen.getByTestId('order-confirmation-order-number-text')).toHaveTextContent(`Your order number is ${order.orderId}`);
            expect(screen.getByTestId('order-confirmation-order-status-text'))
                .toHaveTextContent(getTextContent(languageService.translate('order_confirmation.order_without_support_number_text', {
                    orderNumber: defaultProps.order.orderId,
                    supportEmail: defaultProps.supportEmail,
                })));
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
            render(<OrderStatusTest {...defaultProps} order={order} />);

            expect(screen.getByText(languageService.translate('order_confirmation.order_pending_review_text'))).toBeInTheDocument();
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
            render(<OrderStatusTest {...defaultProps} order={order} />);

            expect(screen.getByText(languageService.translate('order_confirmation.order_pending_review_text'))).toBeInTheDocument();
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
            render(<OrderStatusTest {...defaultProps} order={order} />);

            expect(screen.getByTestId('order-confirmation-order-status-text'))
                .toHaveTextContent(getTextContent(languageService.translate('order_confirmation.order_pending_status_text', {
                    orderNumber: defaultProps.order.orderId,
                    supportEmail: defaultProps.supportEmail,
                })));
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
            render(<OrderStatusTest {...defaultProps} order={order} />);

            expect(screen.getByTestId('order-confirmation-order-status-text'))
                .toHaveTextContent(getTextContent(languageService.translate('order_confirmation.order_pending_status_text', {
                    orderNumber: defaultProps.order.orderId,
                    supportEmail: defaultProps.supportEmail,
                })));
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
            render(
                <OrderStatusTest {...defaultProps} order={{ ...order, isDownloadable: true }} />,
            );

            expect(screen.getByTestId('order-confirmation-digital-items-text'))
                .toHaveTextContent(languageService.translate('order_confirmation.order_with_downloadable_digital_items_text'));
        });

        it('renders status without downloadable items text if order it not yet downloadable', () => {
            render(
                <OrderStatusTest {...defaultProps} order={{ ...order, isDownloadable: false }} />,
            );

            expect(screen.getByTestId("order-confirmation-digital-items-text")).toHaveTextContent(
                languageService.translate('order_confirmation.order_without_downloadable_digital_items_text')
            );
        });
    });

    describe('when order has mandate', () => {
        beforeEach(() => {
            order = getOrderWithMandateURL();
        });

        it('renders mandate link if it is provided', () => {
            render(<OrderStatusTest {...defaultProps} order={order} />);

            expect(screen.getByTestId('order-confirmation-mandate-link-text')).toHaveAttribute('href', 'https://www.test.com/mandate');
            expect(screen.queryByTestId('order-confirmation-mandate-id-text')).not.toBeInTheDocument();
        });

        it('renders mandate id if it is provided', () => {
            order = getOrderWithMandateId();

            render(<OrderStatusTest {...defaultProps} order={order} />);

            expect(screen.queryByTestId('order-confirmation-mandate-link-text')).not.toBeInTheDocument();
            expect(screen.getByTestId('order-confirmation-mandate-id-text')).toBeInTheDocument();
        });

        it('renders "SEPA Direct Debit Mandate" text on mandate link when provider description is Stripe (SEPA)', () => {
            render(
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

            expect(screen.getByTestId("order-confirmation-mandate-link-text")).toHaveTextContent('SEPA Direct Debit Mandate');
        });

        it('renders "SEPA Direct Debit Mandate" text when provider description is Checkout.com', () => {
            render(
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

            expect(screen.getByTestId("order-confirmation-mandate-id-text")).toHaveTextContent('SEPA Direct Debit (via Checkout.com) Mandate Reference: ABC123');
        });

        it('does not render mandate id or url if it is not provided', () => {
            render(
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

            expect(screen.queryByTestId("order-confirmation-mandate-link-text")).not.toBeInTheDocument();
            expect(screen.queryByTestId("order-confirmation-mandate-id-text")).not.toBeInTheDocument();
        });
    });

    it('render mandateText list', () => {
        const order = getOrder();

        order.payments = [{
            detail: {
                step: '1',
                instructions: '1',
            },
            description: 'test',
            amount: 1,
            providerId: 'paypalcommercealternativemethod',
            methodId: 'ratepay',
            mandate: {
                id: '',
                url: '',
                mandateText: {
                    account_holder_name: 'Name',
                },
            }
        }];

        render(<OrderStatusTest {...defaultProps} order={order} />);

        expect(screen.getByTestId('order-confirmation-mandate-text-list')).toBeInTheDocument();
    });
});
