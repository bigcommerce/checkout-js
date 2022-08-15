import { GiftCertificate, OrderPayments } from '@bigcommerce/checkout-sdk';

import isGiftCertificatePayment from './isGiftCertificatePayment';

export default function mapFromPayments(payments: OrderPayments): GiftCertificate[] {
    return payments.filter(isGiftCertificatePayment).map(({ amount, detail }) => ({
        code: detail.code,
        remaining: detail.remaining,
        used: amount,
        balance: amount + detail.remaining,
        purchaseDate: '',
    }));
}
