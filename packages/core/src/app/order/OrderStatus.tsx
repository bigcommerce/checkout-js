import { GatewayOrderPayment, GiftCertificateOrderPayment, Order } from '@bigcommerce/checkout-sdk';
import React, { memo, FunctionComponent } from 'react';

import { TranslatedHtml, TranslatedString } from '../locale';

import OrderConfirmationSection from './OrderConfirmationSection';

export interface OrderStatusProps {
    supportEmail: string;
    supportPhoneNumber?: string;
    order: Order;
}

type PaymentWithMandate = GatewayOrderPayment & Required<Pick<GatewayOrderPayment, 'mandate' | 'methodId'>>;

const isPaymentWithMandate = (payment: GatewayOrderPayment | GiftCertificateOrderPayment): payment is PaymentWithMandate =>
    !!payment.methodId && ('mandate' in payment && !!payment.mandate);

const OrderStatus: FunctionComponent<OrderStatusProps> = ({
    order,
    supportEmail,
    supportPhoneNumber,
}) => {

    const paymentsWithMandates = order.payments?.filter(isPaymentWithMandate) || [];

    return <OrderConfirmationSection>
        { order.orderId &&
        <p data-test="order-confirmation-order-number-text">
            <TranslatedHtml
                data={ { orderNumber: order.orderId } }
                id="order_confirmation.order_number_text"
            />
        </p> }

        <p data-test="order-confirmation-order-status-text">
            <OrderStatusMessage
                orderNumber={ order.orderId }
                orderStatus={ order.status }
                supportEmail={ supportEmail }
                supportPhoneNumber={ supportPhoneNumber }
            />
        </p>
        {
            paymentsWithMandates.map(payment => {
                if (payment.mandate.url) {
                        return <a data-test="order-confirmation-mandate-link-text" href={ payment.mandate.url } key={ `${payment.providerId}-${payment.methodId}-mandate` } rel="noopener noreferrer" target="_blank">
                            <TranslatedString
                                id={ `order_confirmation.mandate.${payment.providerId}.${payment.methodId}` }
                            />
                        </a>;
                } else if (payment.mandate.id) {
                    return <p data-test="order-confirmation-mandate-id-text" key={ `${payment.providerId}-${payment.methodId}-mandate` }>
                        <TranslatedString
                            data={ { mandate : payment.mandate.id } }
                            id={ `order_confirmation.mandate.${payment.providerId}.${payment.methodId}` }
                        />
                    </p>;
                }
            })
        }

        { order.hasDigitalItems &&
        <p data-test="order-confirmation-digital-items-text">
            <TranslatedHtml
                id={ order.isDownloadable ?
                    'order_confirmation.order_with_downloadable_digital_items_text' :
                    'order_confirmation.order_without_downloadable_digital_items_text' }
            />
        </p> }
    </OrderConfirmationSection>;
};

interface OrderStatusMessageProps {
    orderNumber: number;
    orderStatus: string;
    supportEmail?: string;
    supportPhoneNumber?: string;
}

const OrderStatusMessage: FunctionComponent<OrderStatusMessageProps> = ({
    orderNumber,
    orderStatus,
    supportEmail,
    supportPhoneNumber,
}) => {
    switch (orderStatus) {
    case 'MANUAL_VERIFICATION_REQUIRED':
    case 'AWAITING_PAYMENT':
        return <TranslatedHtml
            id="order_confirmation.order_pending_review_text"
        />;

    case 'PENDING':
        return <TranslatedHtml
            data={ { orderNumber, supportEmail } }
            id="order_confirmation.order_pending_status_text"
        />;

    case 'INCOMPLETE':
        return <TranslatedHtml
            data={ { orderNumber, supportEmail } }
            id="order_confirmation.order_incomplete_status_text"
        />;

    default:
        return <TranslatedHtml
            data={ { orderNumber, supportEmail, supportPhoneNumber } }
            id={ supportPhoneNumber ?
                'order_confirmation.order_with_support_number_text' :
                'order_confirmation.order_without_support_number_text' }
        />;
    }
};

export default memo(OrderStatus);
