import { Checkout, CheckoutPayment } from '@bigcommerce/checkout-sdk';

import { isGiftCertificatePayment } from '../giftCertificate';

import { isStoreCreditPayment } from './storeCredit';

export default function getPreselectedPayment(checkout: Checkout): CheckoutPayment | undefined {
    const payments = checkout && checkout.payments ? checkout.payments : [];

    return payments.find(
        (payment) =>
            !isGiftCertificatePayment(payment) &&
            !isStoreCreditPayment(payment) &&
            !!payment.providerId,
    );
}
