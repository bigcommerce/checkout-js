import React, { Fragment, FunctionComponent } from 'react';

import { withCurrency, WithCurrencyProps } from '../locale';

export interface StoreCurrencyProps {
    amount: number;
}

const StoreCurrency: FunctionComponent<StoreCurrencyProps & WithCurrencyProps> = ({
    amount,
    currency,
}) => (
    <Fragment>
        { currency.toStoreCurrency(amount) }
    </Fragment>
);

export default withCurrency(StoreCurrency);
