import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import { useMemo } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';

export type PoDisabledReason = 'creditLimit' | 'currencyMismatch';

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
    const creditLimit = poConfig?.creditLimit;
    const expectedCurrency = poConfig?.currency;

    const isNotPoMethod = method.id !== 'cheque';
    const isPoConfigIncomplete = creditLimit == null || !expectedCurrency;
    const isCartDataMissing = grandTotal == null || !cartCurrencyCode;

    if (isNotPoMethod || isPoConfigIncomplete || isCartDataMissing) {
        return null;
    }

    if (expectedCurrency.toUpperCase() !== cartCurrencyCode.toUpperCase()) {
        return 'currencyMismatch';
    }

    if (grandTotal > creditLimit) {
        return 'creditLimit';
    }

    return null;
}

export function usePoMethodDisabledReason(
    method: PaymentMethod | undefined,
): PoDisabledReason | undefined {
    const { selectedState } = useCheckout(({ data }) => ({
        grandTotal: data.getCheckout()?.grandTotal,
        cartCurrencyCode: data.getCart()?.currency.code,
    }));
    const {
        payment: { poConfig },
    } = useCapabilities();

    const grandTotal = selectedState?.grandTotal;
    const cartCurrencyCode = selectedState?.cartCurrencyCode;

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
