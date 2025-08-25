import { type ComponentType } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
} from '@bigcommerce/checkout/payment-integration-api';

import { resolveComponent , resolveLazyComponent } from '../common/resolver';
import * as paymentMethods from '../generated/paymentIntegrations';
import * as lazyPaymentMethods from '../generated/paymentIntegrations/lazy';

export default function resolvePaymentMethod(
    query: PaymentMethodResolveId,
    useLazyLoad: boolean,
): ComponentType<PaymentMethodProps> | undefined {
    if (useLazyLoad) {
        const { ComponentRegistry, ...components } = lazyPaymentMethods;

        return resolveLazyComponent<PaymentMethodResolveId, PaymentMethodProps>(
            query, 
            components, 
            ComponentRegistry,
        );
    }

    return resolveComponent<PaymentMethodResolveId, PaymentMethodProps>(query, paymentMethods);
}
