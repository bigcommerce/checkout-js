import { OrderPayment } from '@bigcommerce/checkout-sdk';

import { isStoreCreditPayment } from '../payment/storeCredit';

export default function getStoreCreditAmount(payments?: OrderPayment[]): number {
    return (payments || [])
        .filter(isStoreCreditPayment)
        .reduce((total, payment) => total + payment.amount, 0);
}
