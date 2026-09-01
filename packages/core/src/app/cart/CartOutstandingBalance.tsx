import React, { type FunctionComponent } from 'react';

import { ShopperCurrency } from '../currency';
import { PriceTicker } from '../order/PriceTicker';
import { PriceTickerPhase, usePriceChangeTicker } from '../order/usePriceChangeTicker';

export interface CartOutstandingBalanceProps {
    amount: number;
    currencyCode: string;
}

// Owns the ticker state so phase changes re-render only this span, not the drawer.
export const CartOutstandingBalance: FunctionComponent<CartOutstandingBalanceProps> = ({
    amount,
    currencyCode,
}) => {
    const { phase, displayAmount } = usePriceChangeTicker(amount);

    return (
        <span
            aria-busy={phase !== PriceTickerPhase.Idle || undefined}
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
