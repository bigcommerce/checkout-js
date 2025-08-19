import {
    type CheckoutPayment,
    type GiftCertificateOrderPayment,
    type OrderPayment,
} from '@bigcommerce/checkout-sdk';

export default function isGiftCertificatePayment(
    payment: OrderPayment | CheckoutPayment,
): payment is GiftCertificateOrderPayment {
    return payment.providerId === 'giftcertificate';
}
