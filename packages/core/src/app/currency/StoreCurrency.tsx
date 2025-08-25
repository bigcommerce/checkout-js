import React, { type FunctionComponent } from 'react';

import { withCurrency, type WithCurrencyProps } from '@bigcommerce/checkout/locale';

export interface StoreCurrencyProps {
    amount: number;
}

const StoreCurrency: FunctionComponent<StoreCurrencyProps & WithCurrencyProps> = ({
    amount,
    currency,
}) => <>{currency.toStoreCurrency(amount)}</>;

export default withCurrency(StoreCurrency);
