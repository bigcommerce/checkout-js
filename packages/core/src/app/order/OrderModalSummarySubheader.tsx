import { LineItemMap } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo, ReactNode } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import getItemsCount from './getItemsCount';

export interface OrderModalSummarySubheaderProps {
    items: LineItemMap
    amountWithCurrency: ReactNode;
    shopperCurrencyCode: string;
    storeCurrencyCode: string;
}

const OrderModalSummarySubheader: FunctionComponent<OrderModalSummarySubheaderProps> = ({
    items,
    shopperCurrencyCode,
    storeCurrencyCode,
    amountWithCurrency,
}) => {
    const itemsCount = getItemsCount(items);
    const hasDifferentCurrency = shopperCurrencyCode !== storeCurrencyCode;
    const itemsText = itemsCount === 1 ? 'cart.item' : 'cart.items';

    return <>
        {itemsCount} <TranslatedString id={itemsText} /> | {amountWithCurrency} {
            hasDifferentCurrency && <span>({shopperCurrencyCode})</span>
        }
    </>;
};

export default memo(OrderModalSummarySubheader);
