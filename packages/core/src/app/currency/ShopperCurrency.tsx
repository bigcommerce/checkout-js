import React, { FunctionComponent } from 'react';

import { withCurrency, WithCurrencyProps } from '@bigcommerce/checkout/locale';

export interface ShopperCurrencyProps {
    amount: number;
}

const ShopperCurrency: FunctionComponent<ShopperCurrencyProps & WithCurrencyProps> = ({
    amount,
    currency,
}) => <>{currency.toCustomerCurrency(amount)}</>;

export default withCurrency(ShopperCurrency);
