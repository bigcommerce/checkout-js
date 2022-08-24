import { PaymentMethodProps, PaymentMethodResolveId } from '@bigcommerce/checkout/payment-integration-api';
import { ComponentType } from 'react';

import { resolveComponent } from '../common/resolver';

import * as paymentMethods from '../generated/paymentIntegrations';

console.log('methods are:', paymentMethods);

export default function resolvePaymentMethod(query: PaymentMethodResolveId): ComponentType<PaymentMethodProps> | undefined {
    return resolveComponent<PaymentMethodResolveId, PaymentMethodProps>(
        query,
        paymentMethods
    );
}
