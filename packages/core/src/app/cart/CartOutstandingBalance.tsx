import React, { type FunctionComponent } from 'react';

import { ShopperCurrency } from '../currency';
import { PriceTicker } from '../order/PriceTicker';
import { PriceTickerPhase, usePriceChangeTicker } from '../order/usePriceChangeTicker';

interface CartOutstandingBalanceProps {
    amount: number;
    currencyCode: string;
}

export const CartOutstandingBalance: FunctionComponent<CartOutstandingBalanceProps> = ({
    amount,
    currencyCode,
}) => {
    // Keep the ticker state here so phase changes re-render only this span, not the drawer.
    const { phase, displayAmount } = usePriceChangeTicker(amount);
    const isPriceUpdating = phase !== PriceTickerPhase.Idle || undefined;

    return (
        <span
            aria-busy={isPriceUpdating}
            aria-live="polite"
            className="sub-header"
            data-test="cart-outstanding-balance"
        >
            <PriceTicker phase={phase}>
                <ShopperCurrency amount={displayAmount ?? amount} /> ({currencyCode})
            </PriceTicker>
        </span>
    );
};
