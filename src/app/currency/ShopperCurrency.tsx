import React, { Fragment, FunctionComponent } from 'react';

import { withCurrency, WithCurrencyProps } from '../locale';

export interface ShopperCurrencyProps {
    amount: number;
}

const ShopperCurrency: FunctionComponent<ShopperCurrencyProps & WithCurrencyProps> = ({
    amount,
    currency,
}) => (
    <Fragment>
        { currency.toCustomerCurrency(amount) }
    </Fragment>
);

export default withCurrency(ShopperCurrency);
