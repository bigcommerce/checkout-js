import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import getUniquePaymentMethodId from './paymentMethod/getUniquePaymentMethodId';

/**
 * POC: order-independent signature of the set of available payment methods.
 * Used to decide whether PaymentForm genuinely needs to remount (the set of
 * methods actually changed) versus just re-rendering with fresh props (e.g.
 * a coupon changed the order total but the same methods are still on offer).
 */
export default function getPaymentMethodsSignature(methods: PaymentMethod[]): string {
    return methods
        .map((method) => getUniquePaymentMethodId(method.id, method.gateway))
        .sort()
        .join('|');
}
