import { PaymentMethodProps } from '@bigcommerce/checkout-js/payment-integration';
import { ComponentType } from 'react';

import { resolveComponent } from '../common/resolver';
import { RequireAtLeastOne } from '../common/types';

export type PaymentMethodResolveId = RequireAtLeastOne<{
    id?: string;
    gateway?: string;
    type?: string;
}>;

export default function resolvePaymentMethod(query: PaymentMethodResolveId): ComponentType<PaymentMethodProps> | undefined {
    return resolveComponent<PaymentMethodResolveId, PaymentMethodProps>(
        query,
        require('../generated/paymentMethods')
    );
}
