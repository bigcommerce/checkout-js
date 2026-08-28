import React, { type FunctionComponent } from 'react';

import { ShopperCurrency } from '../currency';
import { PriceTicker } from '../order/PriceTicker';
import { usePriceChangeTicker } from '../order/usePriceChangeTicker';

export interface CartOutstandingBalanceProps {
    amount: number;
    currencyCode: string;
}

// Owns the ticker state so phase changes re-render only this span, not the drawer.
export const CartOutstandingBalance: FunctionComponent<CartOutstandingBalanceProps> = ({
    amount,
    currencyCode,
}) => {
    const ticker = usePriceChangeTicker(amount);

    return (
        <span
            aria-busy={ticker.phase !== 'idle' || undefined}
            aria-live="polite"
            className="sub-header"
            data-test="cart-outstanding-balance"
        >
            <PriceTicker ticker={ticker}>
                <ShopperCurrency amount={ticker.displayAmount ?? amount} /> ({currencyCode})
            </PriceTicker>
        </span>
    );
};
