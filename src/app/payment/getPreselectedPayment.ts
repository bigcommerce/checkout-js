import { Checkout, CheckoutPayment } from '@bigcommerce/checkout-sdk';

import isGiftCertificatePayment from './isGiftCertificatePayment';
import isStoreCreditPayment from './isStoreCreditPayment';

export default function getPreselectedPayment(checkout: Checkout): CheckoutPayment | undefined {
    const payments = checkout && checkout.payments ? checkout.payments : [];

    return payments.find(payment =>
        !isGiftCertificatePayment(payment)
            && !isStoreCreditPayment(payment)
            && !!payment.providerId
    );
}
