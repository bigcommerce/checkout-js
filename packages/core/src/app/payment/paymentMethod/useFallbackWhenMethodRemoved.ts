import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import { useEffect } from 'react';

import getUniquePaymentMethodId from './getUniquePaymentMethodId';
import hasPaymentMethodWithId from './hasPaymentMethodWithId';

export default function useFallbackWhenMethodRemoved(
    methods: PaymentMethod[],
    currentUniqueId: string | undefined,
    fallbackUniqueId: string | undefined,
    onFallback: (fallbackUniqueId: string) => void,
): void {
    // Keyed on id strings because callers rebuild `methods` on every render.
    const methodIdsKey = methods
        .map((method) => getUniquePaymentMethodId(method.id, method.gateway))
        .join(',');

    useEffect(() => {
        if (!currentUniqueId || hasPaymentMethodWithId(methods, currentUniqueId)) {
            return;
        }

        // A transiently empty list has no valid fallback; keep the current selection.
        if (!fallbackUniqueId || !hasPaymentMethodWithId(methods, fallbackUniqueId)) {
            return;
        }

        onFallback(fallbackUniqueId);
    }, [methodIdsKey, currentUniqueId, fallbackUniqueId]);
}
