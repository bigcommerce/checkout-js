import {
    CheckoutPayment,
    GiftCertificateOrderPayment,
    OrderPayment,
} from '@bigcommerce/checkout-sdk';

export default function isGiftCertificatePayment(
    payment: OrderPayment | CheckoutPayment,
): payment is GiftCertificateOrderPayment {
    return payment.providerId === 'giftcertificate';
}
