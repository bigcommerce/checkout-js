import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import { useMemo } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';

export type PoDisabledReason =
    | { kind: 'creditLimit' }
    | { kind: 'currencyMismatch'; expectedCurrency: string };

export interface GetPoMethodDisabledReasonArgs {
    method: PaymentMethod;
    poConfig: { creditLimit: number | null; currency: string } | null;
    grandTotal: number | undefined;
    cartCurrencyCode: string | undefined;
}

export function getPoMethodDisabledReason({
    method,
    poConfig,
    grandTotal,
    cartCurrencyCode,
}: GetPoMethodDisabledReasonArgs): PoDisabledReason | null {
    if (
        method.id !== 'cheque' ||
        !poConfig ||
        poConfig.creditLimit == null ||
        !poConfig.currency ||
        grandTotal == null ||
        !cartCurrencyCode
    ) {
        return null;
    }

    if (poConfig.currency.toUpperCase() !== cartCurrencyCode.toUpperCase()) {
        return { kind: 'currencyMismatch', expectedCurrency: poConfig.currency };
    }

    if (grandTotal > poConfig.creditLimit) {
        return { kind: 'creditLimit' };
    }

    return null;
}

export function usePoMethodDisabledReason(
    method: PaymentMethod | undefined,
): PoDisabledReason | undefined {
    const {
        checkoutState: {
            data: { getCart, getCheckout },
        },
    } = useCheckout();
    const {
        payment: { poConfig },
    } = useCapabilities();

    const grandTotal = getCheckout()?.grandTotal;
    const cartCurrencyCode = getCart()?.currency.code;

    return useMemo(() => {
        if (!method) {
            return undefined;
        }

        return (
            getPoMethodDisabledReason({
                method,
                poConfig,
                grandTotal,
                cartCurrencyCode,
            }) ?? undefined
        );
    }, [method, poConfig, grandTotal, cartCurrencyCode]);
}
