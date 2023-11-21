import { GatewayOrderPayment, GiftCertificateOrderPayment, Order, StoreConfig } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { TranslatedHtml } from '@bigcommerce/checkout/locale';

import OrderConfirmationSection from './OrderConfirmationSection';
import { PaymentsWithMandates } from './PaymentsWithMandates';

export interface OrderStatusProps {
    config: StoreConfig;
    supportEmail: string;
    supportPhoneNumber?: string;
    order: Order;
}

type PaymentWithMandate = GatewayOrderPayment &
    Required<Pick<GatewayOrderPayment, 'mandate' | 'methodId'>>;

const isPaymentWithMandate = (
    payment: GatewayOrderPayment | GiftCertificateOrderPayment,
): payment is PaymentWithMandate => !!payment.methodId && 'mandate' in payment && !!payment.mandate;

const OrderStatus: FunctionComponent<OrderStatusProps> = ({
    config,
    order,
    supportEmail,
    supportPhoneNumber,
}) => {
    const paymentsWithMandates = order.payments?.filter(isPaymentWithMandate) || [];

    return (
        <OrderConfirmationSection>
            {order.orderId && (
                <p data-test="order-confirmation-order-number-text">
                    <TranslatedHtml
                        data={{ orderNumber: order.orderId }}
                        id="order_confirmation.order_number_text"
                    />
                </p>
            )}

            <p data-test="order-confirmation-order-status-text">
                <OrderStatusMessage
                    config={config}
                    orderNumber={order.orderId}
                    orderStatus={order.status}
                    supportEmail={supportEmail}
                    supportPhoneNumber={supportPhoneNumber}
                />
            </p>
            <PaymentsWithMandates
                paymentsWithMandates={paymentsWithMandates}
            />
            {order.hasDigitalItems && (
                <p data-test="order-confirmation-digital-items-text">
                    <TranslatedHtml
                        id={
                            order.isDownloadable
                                ? 'order_confirmation.order_with_downloadable_digital_items_text'
                                : 'order_confirmation.order_without_downloadable_digital_items_text'
                        }
                    />
                </p>
            )}
        </OrderConfirmationSection>
    );
};

interface OrderStatusMessageProps {
    config: StoreConfig;
    orderNumber: number;
    orderStatus: string;
    supportEmail?: string;
    supportPhoneNumber?: string;
}

const OrderStatusMessage: FunctionComponent<OrderStatusMessageProps> = ({
    config,
    orderNumber,
    orderStatus,
    supportEmail,
    supportPhoneNumber,
}) => {
    switch (orderStatus) {
        case 'MANUAL_VERIFICATION_REQUIRED':
        case 'AWAITING_PAYMENT':
            return <TranslatedHtml id="order_confirmation.order_pending_review_text" />;

        case 'PENDING':
            return (
                <TranslatedHtml
                    data={{ orderNumber, supportEmail }}
                    id="order_confirmation.order_pending_status_text"
                />
            );

        case 'INCOMPLETE':
            if (config.checkoutSettings.features['CHECKOUT-6891.update_incomplete_order_wording_on_order_confirmation_page']) {
                return (
                    <TranslatedHtml
                        data={{ orderNumber, supportEmail }}
                        id="order_confirmation.order_pending_status_text"
                    />
                );
            }

            return (
                <TranslatedHtml
                    data={{ orderNumber, supportEmail }}
                    id="order_confirmation.order_incomplete_status_text"
                />
            );

        default:
            return (
                <TranslatedHtml
                    data={{ orderNumber, supportEmail, supportPhoneNumber }}
                    id={
                        supportPhoneNumber
                            ? 'order_confirmation.order_with_support_number_text'
                            : 'order_confirmation.order_without_support_number_text'
                    }
                />
            );
    }
};

export default memo(OrderStatus);
