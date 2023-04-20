import { LineItem, LineItemMap } from '@bigcommerce/checkout-sdk';
import { flatMap } from 'lodash';
import React, { FunctionComponent, memo } from 'react';

import { withCurrency, WithCurrencyProps } from '../locale';

export interface OrderSummaryTotalProps {
    items: LineItemMap
    orderAmount: number;
    shopperCurrencyCode: string;
    storeCurrencyCode: string;
}

const OrderModalSummarySubheader: FunctionComponent<OrderSummaryTotalProps & WithCurrencyProps> = ({
    items,
    shopperCurrencyCode,
    storeCurrencyCode,
    orderAmount,
    currency,
}) => {
    const itemsCount = flatMap(items).reduce((count: number, item: LineItem) => {
        return count + item.quantity;
    }, 0);
    const hasDifferentCurrency = shopperCurrencyCode !== storeCurrencyCode;

    const itemsText = `${itemsCount} ${itemsCount === 1 ? 'item' : 'items'}`;
    const total = `(${hasDifferentCurrency ? `${shopperCurrencyCode} ` : ''}${currency.toCustomerCurrency(orderAmount)})`;

    return <>{`${itemsText} ${total}`}</>;
};

export default memo(withCurrency(OrderModalSummarySubheader));
