import { Order } from '@bigcommerce/checkout-sdk';
import React, { memo, useCallback, FunctionComponent } from 'react';

import { TranslatedHtml, TranslatedString } from '../locale';

import OrderConfirmationSection from './OrderConfirmationSection';

export interface OrderStatusProps {
    supportEmail: string;
    supportPhoneNumber?: string;
    order: Order;
}

const OrderStatus: FunctionComponent<OrderStatusProps> = ({
    order,
    supportEmail,
    supportPhoneNumber,
}) => {

    const getMandateProvider = useCallback(() => {
        return order?.payments?.[0].description === 'Stripe (SEPA)' ? 'SEPA Direct Debit' : order?.payments?.[0].description;
    }, [order]);

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

        { order.mandateUrl && <a data-test="order-confirmation-mandate-link-text" href={ order.mandateUrl } rel="noopener noreferrer" target="_blank">
                <TranslatedString
                    data={ { provider : getMandateProvider() } }
                    id="order_confirmation.mandate_link_text"
                />
        </a> }

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
        return <TranslatedString
            id="order_confirmation.order_pending_review_text"
        />;

    case 'PENDING':
        return <TranslatedString
            data={ { orderNumber, supportEmail } }
            id="order_confirmation.order_pending_status_text"
        />;

    case 'INCOMPLETE':
        return <TranslatedString
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
