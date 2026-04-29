import { PaymentMethodId } from '../paymentMethod';

import { type PaymentMethodFilter } from './types';

const MULTI_SHIPPING_INCOMPATIBLE_METHOD_IDS: string[] = [PaymentMethodId.AmazonPay];

export const multiShippingFilter: PaymentMethodFilter = {
    name: 'multiShipping',
    apply(methods, { checkout }) {
        if (!checkout.consignments || checkout.consignments.length <= 1) {
            return methods;
        }

        return methods.filter(
            (method) => !MULTI_SHIPPING_INCOMPATIBLE_METHOD_IDS.includes(method.id),
        );
    },
};
