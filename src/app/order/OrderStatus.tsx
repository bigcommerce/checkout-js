import { Order } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { TranslatedHtml, TranslatedString } from '../locale';

import OrderConfirmationSection from './OrderConfirmationSection';

export interface OrderStatusProps {
    supportEmail?: string;
    supportPhoneNumber?: string;
    order: Order;
}

const OrderStatus: FunctionComponent<OrderStatusProps> = ({
    order,
    supportEmail,
    supportPhoneNumber,
}) => {
    const isPendingReview = order.status === 'MANUAL_VERIFICATION_REQUIRED';
    const orderNumber = order.orderId;

    return <OrderConfirmationSection>
        { orderNumber &&
        <p data-test="order-confirmation-order-number-text">
            <TranslatedHtml
                id="order_confirmation.order_number_text"
                data={ { orderNumber } }
            />
        </p> }

        { isPendingReview &&
        <p>
            <TranslatedString
                id="order_confirmation.order_pending_review_text"
            />
        </p> }

        { !isPendingReview &&
        <p>
            <TranslatedHtml
                id={ supportPhoneNumber ?
                    'order_confirmation.order_with_support_number_text' :
                    'order_confirmation.order_without_support_number_text' }
                data={ { orderNumber, supportEmail, supportPhoneNumber } }
            />
        </p> }

        { order.hasDigitalItems &&
        <p>
            <TranslatedHtml
                id={ order.isDownloadable ?
                    'order_confirmation.order_with_downloadable_digital_items_text' :
                    'order_confirmation.order_without_downloadable_digital_items_text' }
            />
        </p> }
    </OrderConfirmationSection>;
};

export default OrderStatus;
