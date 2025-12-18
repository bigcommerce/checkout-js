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
    const { ComponentRegistry, ...allExports } = lazyPaymentMethods;
    const components = Object.fromEntries(
        Object.keys(ComponentRegistry).map((key) => [key, allExports[key as keyof typeof allExports]])
    );

    return resolveLazyComponent<PaymentMethodResolveId, PaymentMethodProps>(
        query,
        components,
        ComponentRegistry,
    );
}
