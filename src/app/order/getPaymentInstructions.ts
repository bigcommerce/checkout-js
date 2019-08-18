import { GatewayOrderPayment, Order, OrderPayment } from '@bigcommerce/checkout-sdk';

import { isGiftCertificatePayment } from '../giftCertificate';
import { isStoreCreditPayment } from '../payment/storeCredit';

export interface PaymentInstructionsProps {
    order: Order;
}

function isDefaultOrderPayment(payment: OrderPayment): payment is GatewayOrderPayment {
    return !isGiftCertificatePayment(payment) && !isStoreCreditPayment(payment);
}

function getPaymentInstructions(order: Order): string {
    const gatewayPayment = (order.payments || []).find(isDefaultOrderPayment);
    const instructions = gatewayPayment && gatewayPayment.detail.instructions;

    if (!instructions) {
        return '';
    }

    return instructions.replace(/%%OrderID%%/g, order.orderId.toString());
}

export default getPaymentInstructions;
