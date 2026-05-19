import { type PaymentMethodFilter } from '@bigcommerce/checkout/payment-integration-api';

import { PaymentMethodId } from '../paymentMethod';

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
