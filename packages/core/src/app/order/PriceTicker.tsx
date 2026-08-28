import React, { type FunctionComponent, type ReactNode } from 'react';

import { LoadingDots } from '@bigcommerce/checkout/ui';

import { type PriceChangeTicker } from './usePriceChangeTicker';

export interface PriceTickerProps {
    ticker: PriceChangeTicker;
    children: ReactNode;
}

export const PriceTicker: FunctionComponent<PriceTickerProps> = ({ ticker, children }) => {
    const { phase } = ticker;

    if (phase === 'idle') {
        return <>{children}</>;
    }

    if (phase === 'dots') {
        return <LoadingDots />;
    }

    return (
        <span
            className={phase === 'exiting' ? 'priceTicker-exit' : 'priceTicker-enter'}
            data-test="price-ticker"
        >
            {children}
        </span>
    );
};
