import React, { type FunctionComponent, type ReactNode } from 'react';

import { LoadingDots } from '@bigcommerce/checkout/ui';

import { PriceTickerPhase } from './usePriceChangeTicker';

export interface PriceTickerProps {
    phase: PriceTickerPhase;
    children: ReactNode;
}

export const PriceTicker: FunctionComponent<PriceTickerProps> = ({ phase, children }) => {
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
