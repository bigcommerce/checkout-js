import type { CheckoutSettings } from '@bigcommerce/checkout-sdk';
import { type ComponentType } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
} from '@bigcommerce/checkout/payment-integration-api';
import { isExperimentEnabled } from '@bigcommerce/checkout/utility';

import { resolveLazyComponent } from '../common/resolver';
import * as lazyPaymentMethods from '../generated/paymentIntegrations';

export default function resolvePaymentMethod(
    query: PaymentMethodResolveId,
    checkoutSettings?: CheckoutSettings,
): ComponentType<PaymentMethodProps> | undefined {
    const { ComponentRegistry, ...allExports } = lazyPaymentMethods;
    const filteredMethods = Object.fromEntries(
        Object.entries(ComponentRegistry).map(([key, value]) => {
            const methods = value.filter((resolveId) => {
                const { experiment } = resolveId as PaymentMethodResolveId;

                if (!experiment) {
                    return true;
                }

                // should be normalized after config
                const normalizedKey = experiment.replace('_', '.');

                return isExperimentEnabled(checkoutSettings, normalizedKey, false);
            });

            return [key, methods];
        }),
    );

    const components = Object.fromEntries(
        Object.keys(filteredMethods).map((key) => [
            key,
            allExports[key as keyof typeof allExports],
        ]),
    );

    return resolveLazyComponent<PaymentMethodResolveId, PaymentMethodProps>(
        query,
        components,
        filteredMethods,
    );
}
