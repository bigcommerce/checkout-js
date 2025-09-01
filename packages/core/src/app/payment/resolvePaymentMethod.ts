import { type ComponentType } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
} from '@bigcommerce/checkout/payment-integration-api';

import { resolveLazyComponent } from '../common/resolver';
import * as lazyPaymentMethods from '../generated/paymentIntegrations';

export default function resolvePaymentMethod(
    query: PaymentMethodResolveId
): ComponentType<PaymentMethodProps> | undefined {
    const { ComponentRegistry, ...components } = lazyPaymentMethods;

    return resolveLazyComponent<PaymentMethodResolveId, PaymentMethodProps>(
        query, 
        components, 
        ComponentRegistry,
    );
}
