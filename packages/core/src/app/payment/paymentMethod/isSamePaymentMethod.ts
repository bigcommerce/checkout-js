import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import getUniquePaymentMethodId from './getUniquePaymentMethodId';

export default function isSamePaymentMethod(a: PaymentMethod, b: PaymentMethod): boolean {
    return getUniquePaymentMethodId(a.id, a.gateway) === getUniquePaymentMethodId(b.id, b.gateway);
}
