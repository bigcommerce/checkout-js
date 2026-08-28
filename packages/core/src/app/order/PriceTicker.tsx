import React, { type FunctionComponent, type ReactNode } from 'react';

import { LoadingDots } from '@bigcommerce/checkout/ui';

import { type PriceChangeTicker, PriceTickerPhase } from './usePriceChangeTicker';

export interface PriceTickerProps {
    ticker: PriceChangeTicker;
    children: ReactNode;
}

export const PriceTicker: FunctionComponent<PriceTickerProps> = ({ ticker, children }) => {
    const { phase } = ticker;

    if (phase === PriceTickerPhase.Idle) {
        return <>{children}</>;
    }

    if (phase === PriceTickerPhase.Dots) {
        return <LoadingDots />;
    }

    return (
        <span
            className={
                phase === PriceTickerPhase.Exiting ? 'priceTicker-exit' : 'priceTicker-enter'
            }
            data-test="price-ticker"
        >
            {children}
        </span>
    );
};
