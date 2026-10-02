import React, { type FunctionComponent } from 'react';

import { withCurrency, type WithCurrencyProps } from '@bigcommerce/checkout/locale';

interface ShopperCurrencyProps {
    amount: number;
}

const ShopperCurrency: FunctionComponent<ShopperCurrencyProps & WithCurrencyProps> = ({
    amount,
    currency,
}) => <>{currency.toCustomerCurrency(amount)}</>;

export default withCurrency(ShopperCurrency);
