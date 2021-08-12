import { Order } from '@bigcommerce/checkout-sdk';
import React, { memo, useCallback, FunctionComponent } from 'react';

import { TranslatedHtml, TranslatedString } from '../locale';

import OrderConfirmationSection from './OrderConfirmationSection';

export interface OrderStatusProps {
    supportEmail: string;
    supportPhoneNumber?: string;
    order: Order;
}

const CHECKOUTCOM_SEPA_METHOD = 'SEPA Direct Debit (via Checkout.com)';

const TEXT_ONLY_METHODS = [CHECKOUTCOM_SEPA_METHOD];

const OrderStatus: FunctionComponent<OrderStatusProps> = ({
    order,
    supportEmail,
    supportPhoneNumber,
}) => {

    const mandateProvider = `${order?.payments?.[0].description}`;

    const getMandateTextId = useCallback(() => {
        const Mandates = [
            { method: 'Stripe (SEPA)', value: 'sepa_link_text' },
            { method: 'OXXO (via Checkout.com)', value: 'oxxo_link_text' },
            { method: 'Boleto Bancário (via Checkout.com)', value: 'boleto_link_text' },
            { method: CHECKOUTCOM_SEPA_METHOD, value: 'mandate_text_only' },
        ];

        const mandateText = Mandates.find(pair => pair.method === mandateProvider);

        return mandateText ? mandateText.value : 'mandate_link_text';
    }, [mandateProvider]);

    const showMandateAsTextOnly = TEXT_ONLY_METHODS.includes(mandateProvider);

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

        { showMandateAsTextOnly || !order.mandateUrl ?
            <MandateText id={ getMandateTextId() } mandate={ order.mandateUrl } provider={ mandateProvider } /> :
            <MandateLink id={ getMandateTextId() } mandate={ order.mandateUrl } provider={ mandateProvider } /> }

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

interface MandateTextProps {
    provider: string;
    id: string;
    mandate: string;
}

const MandateText = ({ provider, id, mandate }: MandateTextProps) => (
    <div data-test="order-confirmation-mandate-text-only">
        <br />
        <TranslatedString
            data={ { provider, mandate } }
            id={ 'order_confirmation.' + id }
        />
    </div>
);

const MandateLink = ({ provider, id, mandate }: MandateTextProps) => (
    <a data-test="order-confirmation-mandate-link-text" href={ mandate } rel="noopener noreferrer" target="_blank">
        <TranslatedString
            data={ { provider } }
            id={ 'order_confirmation.' + id }
        />
    </a>
);

export default memo(OrderStatus);
