import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import getUniquePaymentMethodId from './getUniquePaymentMethodId';

export default function hasPaymentMethodWithId(
    methods: PaymentMethod[],
    uniquePaymentMethodId: string,
): boolean {
    return methods.some(
        (method) => getUniquePaymentMethodId(method.id, method.gateway) === uniquePaymentMethodId,
    );
}
