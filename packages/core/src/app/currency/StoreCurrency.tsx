import React, { FunctionComponent } from 'react';

import { withCurrency, WithCurrencyProps } from '../locale';

export interface StoreCurrencyProps {
    amount: number;
}

const StoreCurrency: FunctionComponent<StoreCurrencyProps & WithCurrencyProps> = ({
    amount,
    currency,
}) => <>{currency.toStoreCurrency(amount)}</>;

export default withCurrency(StoreCurrency);
