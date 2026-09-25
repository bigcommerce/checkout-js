import {
    type LineItemMap,
    type ShopperCurrency as ShopperCurrencyType,
    type StoreCurrency,
} from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent, type ReactNode } from 'react';

import { type OrderSummarySubtotalsProps } from '../coupon';

import OrderSummary from './OrderSummary';
import { getNonBundledItems } from './removeBundledItems';
import { SummaryDrawerV2 } from './SummaryDrawerV2';

export interface OrderSummaryDrawerV2Props extends OrderSummarySubtotalsProps {
    lineItems: LineItemMap;
    total: number;
    headerLink: ReactNode;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrencyType;
    bundledItems?: Pick<LineItemMap, 'physicalItems' | 'digitalItems'>;
}

export const OrderSummaryDrawerV2: FunctionComponent<OrderSummaryDrawerV2Props> = ({
    lineItems,
    total,
    headerLink,
    storeCurrency,
    shopperCurrency,
    bundledItems,
    ...subtotalProps
}) => {
    const { nonBundledItems } = getNonBundledItems(lineItems, bundledItems);

    return (
        <SummaryDrawerV2
            amount={total}
            currencyCode={shopperCurrency.code}
            nonBundledItems={nonBundledItems}
        >
            <OrderSummary
                {...subtotalProps}
                headerLink={headerLink}
                lineItems={lineItems}
                shopperCurrency={shopperCurrency}
                storeCurrency={storeCurrency}
                total={total}
            />
        </SummaryDrawerV2>
    );
};
