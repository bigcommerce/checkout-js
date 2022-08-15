import { PaymentMethodProps, PaymentMethodResolveId } from '@bigcommerce/checkout/payment-integration-api';
import { ComponentType } from 'react';

import { resolveComponent } from '../common/resolver';

export default function resolvePaymentMethod(query: PaymentMethodResolveId): ComponentType<PaymentMethodProps> | undefined {
    return resolveComponent<PaymentMethodResolveId, PaymentMethodProps>(
        query,
        require('../generated/paymentMethods')
    );
}
