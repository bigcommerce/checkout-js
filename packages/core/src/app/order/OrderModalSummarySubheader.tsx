import { LineItem, LineItemMap } from '@bigcommerce/checkout-sdk';
import { flatMap } from 'lodash';
import React, { FunctionComponent, memo, ReactNode } from 'react';

import { withCurrency, WithCurrencyProps } from '../locale';

export interface OrderSummaryTotalProps {
    items: LineItemMap
    amountWithCurrency: ReactNode;
    shopperCurrencyCode: string;
    storeCurrencyCode: string;
}

const OrderModalSummarySubheader: FunctionComponent<OrderSummaryTotalProps & WithCurrencyProps> = ({
    items,
    shopperCurrencyCode,
    storeCurrencyCode,
    amountWithCurrency,
}) => {
    const itemsCount = flatMap(items).reduce((count: number, item: LineItem) => {
        return count + item.quantity;
    }, 0);
    const hasDifferentCurrency = shopperCurrencyCode !== storeCurrencyCode;
    const itemsText = `${itemsCount} ${itemsCount === 1 ? 'item' : 'items'}`;

    return <>{`${itemsText} | ` }{amountWithCurrency} {`${hasDifferentCurrency ? ` ${shopperCurrencyCode  } ` : ''}`}</>;
};

export default memo(withCurrency(OrderModalSummarySubheader));
