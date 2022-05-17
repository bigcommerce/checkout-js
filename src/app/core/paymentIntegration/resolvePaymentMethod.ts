import { ComponentType } from 'react';

import { RequireAtLeastOne } from '../../common/types';
import * as paymentMethods from '../../generated/paymentIntegrations';

import isResolvableComponent from './isResolvableComponent';
import PaymentMethodProps from './PaymentMethodProps';

export type PaymentMethodResolveId = RequireAtLeastOne<{
    id?: string;
    gateway?: string;
    type?: string;
}>;

export default function resolvePaymentMethod(
    query: PaymentMethodResolveId
): ComponentType<PaymentMethodProps> {
    const results: Array<{ component: ComponentType<PaymentMethodProps>; matches: number }> = [];

    for (const [_, PaymentMethod] of Object.entries(paymentMethods)) {
        if (!isResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(PaymentMethod)) {
            continue;
        }

        for (const resolverId of PaymentMethod.resolveIds) {
            const result = { component: PaymentMethod, matches: 0 };

            for (const [key, value] of Object.entries(resolverId)) {
                if (isKeyOfPaymentMethodResolveId(key) && query[key] === value) {
                    result.matches++;
                }
            }

            results.push(result);
        }
    }

    const matched = results.sort((a, b) => b.matches - a.matches)
        .filter(result => result.matches > 0)[0];

    if (matched?.component) {
        return matched.component;
    }

    throw new Error('Unable to resolve to a component with the provided id.');
}

function isKeyOfPaymentMethodResolveId(key: string): key is keyof PaymentMethodResolveId {
    return ['id', 'gateway', 'type'].includes(key);
}
